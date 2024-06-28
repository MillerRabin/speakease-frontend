import system from '/components/system/system.js'
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import safe from "../safe/safe.js";
import fs from '/components/fs/fs.js';
import { LocalString } from '../local/local.js';
import users from "/components/users/users.js";
import { blockchainsByFamily } from '/components/blockchain/blockchain.js';
import CacheFunction from "/components/cacheFunction/cacheFunction.js";

const walletActivityName = 'createWallet';
const walletActivityChangeName = 'changeName';
const walletsFile = 'wallets';
const walletChanges = 'wallets.changes';

const getWalletsCached = new CacheFunction(() => {
  const wallets = fs.load(walletsFile)
  safe.mustBeNonEmptyString(wallets);
  return JSON.parse(wallets);  
});


export function getWallets() {
  return getWalletsCached.call();
}

function safeGetWallets() {
  try {
    return getWallets();
  } catch (e) {
    return {};
  }
}

export async function setWallet(id, name, pinCode, addresses) {
  if (name == null) throw new Error(`name can't be null`);
  if (pinCode == null) throw new Error(`pinCode can't be null`);
  if (addresses == null) throw new Error(`addresses can't be null`);
  const cWallets = safeGetWallets();
  cWallets[id] = {
    id,
    name,
    pinCode: await digestMessage(pinCode),
    wallets: addresses
  };  
  fs.save(walletsFile, JSON.stringify(cWallets));
  getWalletsCached.clear();
}

function setEmail(id, email) {
  const wallets = safeGetWallets();
  const iWallet = wallets[id];
  if (iWallet == null)
    throw new Error(`wallet is not found for user id  ${id}`);
  wallets[id] = {
    ...iWallet,
    email,
  }    
  fs.save(walletsFile, JSON.stringify(wallets));
  getWalletsCached.clear();
  return wallets[id];
}

function renameWallet(id, newName) {
  const wallets = safeGetWallets();
  const iWallet = wallets[id];
  if (iWallet == null)
    throw new Error(`wallet is not found for user id  ${id}`);
  wallets[id] = {
    ...iWallet,
    name: newName
  }  
  fs.save(walletsFile, JSON.stringify(wallets));
  getWalletsCached.clear();
  return wallets[id];
}


function getWalletByUser(user) {
  const wallets = safeGetWallets();
  const iWallet = wallets[user.id];
  if (iWallet == null)
    return reJoinWallet(wallets, user);
  return iWallet;
}

export function updatePrivateKey(family, key) {
  const user = users.getUser();
  const wallets = safeGetWallets();
  const tWallet = wallets[user.id];
  const obj = { private: key };
  tWallet.wallets[family] = obj;
  fs.save(walletsFile, JSON.stringify(wallets));
  return obj;
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function verifyPinCode(wallet, text) {
  const { pinCode } = wallet;
  if (pinCode == null) throw new Error(`pinCode can't be null`);
  if (text == null) throw new Error(`text can't be null`);
  const newHash = await digestMessage(text);
  if (newHash === pinCode) return true;
  if (text == pinCode) {
    setPinCode(wallet.id, text);
    return true;
  }
  return false;
}

export async function setPinCode(id, pinCode) {
  if (pinCode == null) throw new Error(`pinCode can't be null`);
  const cWallets = safeGetWallets();
  if (cWallets == null) throw new Error(`wallet with ${id} is not defined`);
  cWallets[id].pinCode = await digestMessage(pinCode);  
  fs.save(walletsFile, JSON.stringify(cWallets));
  getWalletsCached.clear();
}

export function hasWallet() {
  try {
    getWallets();
    return true;
  } catch (e) {
    return false;
  }
}

function createActivity() {
  const activity = new Activity({
    name: walletActivityName,
    text: new LocalString({
      en: `create my wallet`,
      ru: `создай мне кошелек`,
      ko: `지갑 생성`,
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/createWallet.html',
    order: 1,
    top: ['activities'],
    type: 'general',
    description: new LocalString({
      en:'Use create wallet command to create new or import existing wallet',
      ru:'Используйте команду Создать кошелек, для создания или импорта кошелька',
      ko:'지갑 생성 명령어를 사용하여 새로 생성하시거나 기존 지갑을 가져오세요'
    })
  }, {
    check: function () {
      if (!system.hasName()) return false;
      if (!system.hasEmail()) return false;
      const hw = hasWallet();
      if (hw) return false;
      return true;
    }
  });
  activityManager.start(activity);
  return activity;
}

function editNameActivity() {
  const activity = new Activity({
    name: walletActivityChangeName,
    text: new LocalString({
      en: `Change wallet name`,
      ru: `изменить имя кошелька`,
      ko: `이름 변경`,
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/editName.html',
    order: 10,
    top: ['activities'],
    type: 'general',
    notVisibleAt: ['settings'],
    description: new LocalString({
      en:`If you does not like your wallet's name you can change it`,
      ru:'Если вам не нравится имя вашего кошелька, смените его',
      ko:'지갑 이름에 마음에 드시지 않는다면 변경이 가능합니다'
    })
  }, {
    check: function () {
      const signIn = users.getUser();
      if (!system.hasName() || !signIn) return false;
      const hw = hasWallet();
      if (!hw) return false;
      return true;
    }
  });
  activityManager.start(activity);
  return activity;
}

async function init() {
  createActivity();
  editNameActivity();
}

const numberArray = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9
};

function getPinFromText(text) {
  const textArr = text.split(/[\s\t]+/);
  const pinCode = textArr.map(i => numberArray[i] ?? i);
  if (!pinCode.length) return null;
  return pinCode.join(' ');
}

function formatPrivateKey(key) {
  if (key == null) throw new Error('Private key is undefined');
  if (key.mnemonic != null) return key.mnemonic;
  const pKey = key.private ?? key;
  if (typeof pKey != 'string') throw new Error('private key must be string');
  const wArr = pKey.split('/\t+/');
  if (wArr.length > 1) return key;
  const arr = pKey.match(/.{0,24}/g);
  return arr.join('</br>');
}

init();

const eventTarget = new EventTarget();

function onWalletChanges(callback) {
  eventTarget.addEventListener(walletChanges, callback);
}

function offWalletChanges(callback) {
  eventTarget.removeEventListener(walletChanges, callback);
}

function reJoinWallet(wallets, user) {
  const nWallet = wallets[user.userName];
  if (nWallet == null)
    throw new Error(`wallet is not found for user ${user.userName}`)
  delete wallets[user.userName]
  wallets[user.id] = {
    ...nWallet,
    id: user.id
  }  
  fs.save(walletsFile, JSON.stringify(wallets));
  getWalletsCached.clear();
  return wallets[user.id];
}

function normalizeFamily(key) {
  const ka = key.split(/[\s\t]+/);
  return ka[0].toLowerCase();
}

function getFamilies(addresses) {
  const fb = blockchainsByFamily();
  return Object.keys(addresses).map(a => {
    const tr = fb[normalizeFamily(a)];
    if (tr == null) throw new Error(`Blockchain ${a} is not found`);
    return tr.join(', ');
  }).join(', ');
}

export default {
  has: hasWallet,
  get: getWallets,
  set: setWallet,
  getPinFromText,
  setEmail,
  formatPrivateKey,
  renameWallet,
  getWalletByUser,
  getFamilies,
  setPinCode,
  verifyPinCode,
  updatePrivateKey,
  on: {
    walletChanges: onWalletChanges
  },
  off: {
    walletChanges: offWalletChanges
  }
}
