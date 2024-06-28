import valid from '/components/valid/valid.js';
import { LocalString } from "/components/local/local.js";
import local from "/components/local/local.js";

const blockchainMap = {
  bitcoinPublic: 'bitcoin',
  bitcoinPrivate: 'bitcoin',
  ethereumPrivate: 'ethereum',
  ethereumPublic: 'ethereum',
  solanaPrivate: 'solana',
  solanaPublic: 'solana',
  stellarPublic:  'stellar',
  stellarPrivate: 'stellar',
  tronPublic: 'tron',
  tronPrivate: 'tron'
}


const textWarningData = {
  wrongAddress: new LocalString({
    en: `<p>You need a $2 to be copied into your clipboard but $1 is found</p>`,
    ru: `<p>Вам нужно скопировать $2 в буфер обмена, но $1</p>`,
    ko: `<p>You need a $2 to be copied into your clipboard but $1 is found</p>`,
    format: {
      en: (lText, entity) => {
        return lText
          .replace('$1', entity.fact)
          .replace('$2', entity.need.join(' or '))
      },
      ru: (lText, entity) => {
        const fText = entity.fact == 'ничего' ? 'ничего не найдено' : 'найден $1';
        return lText
          .replace('$1', fText)
          .replace('$2', entity.need.need.join(' или '))
      },
      ko: (lText, entity) => {
        return lText
          .replace('$1', entity.fact)
          .replace('$2', entity.need.need.join(' or '))
      },
    }
  }),
  bitcoinPublic: new LocalString({
    en: `<b>Bitcoin public key</b>`,
    ru: `<b>публичный ключ Биткоина</b>`,
    ko: `<b>비트코인 공개키</b>`,
  }),
  bitcoinPrivate: new LocalString({
    en: `<b>Bitcoin private key</b>`,
    ru: `<b>приватный ключ Биткоина</b>`,
    ko: `<b>비트코인 개인키</b>`,
  }),
  ethereumPrivate: new LocalString({
    en: `<b>Ethereum private key</b>`,
    ru: `<b>приватный ключ Эфира</b>`,
    ko: `<b>이더리움 개인키</b>`,
  }),
  ethereumPublic: new LocalString({
    en: `<b>Ethereum public key</b>`,
    ru: `<b>публичный ключ Эфира</b>`,
    ko: `<b>이더리움 공개키</b>`,
  }),
  solanaPrivate: new LocalString({
    en: `<b>Solana private key</b>`,
    ru: `<b>приватный ключ Солана</b>`,
    ko: `<b>솔라나 개인키</b>`,
  }),
  solanaPublic: new LocalString({
    en: `<b>Solana public key</b>`,
    ru: `<b>публичный ключ Солана</b>`,
    ko: `<b>솔라나 공개키</b>`,
  }),
  stellarPublic: new LocalString({
    en: `<b>Stellar public key</b>`,
    ru: `<b>публичный ключ Стеллар</b>`,
    ko: `<b>Stellar public key</b>`,
  }),
  stellarPrivate: new LocalString({
    en: `<b>Stellar private key</b>`,
    ru: `<b>приватный ключ Стеллар</b>`,
    ko: `<b>Stellar private key</b>`,
  }),
  tronPublic: new LocalString({
    en: `<b>Tron public key</b>`,
    ru: `<b>публичный ключ Tron</b>`,
    ko: `<b>Tron public key</b>`,
  }),
  tronPrivate: new LocalString({
    en: `<b>Tron private key</b>`,
    ru: `<b>приватный ключ Tronр</b>`,
    ko: `<b>Tron private key</b>`,
  }),
  email: new LocalString({
    en: `<b>email</b>`,
    ru: `<b>электронная почта</b>`,
    ko: `<b>email</b>`,
  }),
  nothing: new LocalString({
    en: `nothing`,
    ru: `ничего`,
    ko: `nothing`,
  }),
  firstTry: new LocalString({
    en: `<p>Please copy $1 to your clipboard</p>`,
    ru: `<p>Пожалуйста, вставьте $1 в ваш буфер обмена</p>`,
    ko: `<p>Please copy $1 to your clipboard</p>`,
    format: {
      en: (lText, entity) => {
        return lText.replace('$1', entity.need.join(' or '))
      },
      ru: (lText, entity) => {
        return lText.replace('$1', entity.need.join(' или '))
      },
      ko: (lText, entity) => {
        return lText.replace('$1', entity.join(' or '))
      },
    }
  }),
  backBtn: new LocalString({
    en: `
    <p>If you change your mind just say back or click back button</p>
    <button is="speakease-taskbutton" task="$1" class="back" stage=$2 postfix="Back">Back</button>
  `,
  ru: `
    <p>Передумали, просто нажмите кнопку назад или произнесите</p>
    <button is="speakease-taskbutton" task="$1" class="back" stage=$2 postfix="Back">Назад</button>
  `,
  ko: `
    <p>If you change your mind just press back button or pronounce - back</p>
    <button is="speakease-taskbutton" task="$1" class="back" stage=$2 postfix="Back">Back</button>
  `,
  format: {
    en: (lText, entity) => {
      return lText
        .replace('$1', entity.task)
        .replace('$2', entity.stage)
    },
    ru: (lText, entity) => {
      return lText
        .replace('$1', entity.task)
        .replace('$2', entity.stage)
    },
    ko: (lText, entity) => {
      return lText
        .replace('$1', entity.task)
        .replace('$2', entity.stage)
    },
  }
  }),
}

function getBackBtn(task, stage) {
  const res = textWarningData['backBtn'].format({task, stage});
  return res;
}

function getBitcoinPrivate(text) {
  return valid.isBitcoinKey(text) ? text : null;
}

function getEthereumPrivate(text) {
  return valid.isEthereumKey(text) ? text : null;
}

function getSolanaPrivate(text) {
  return valid.isSolanaKey(text) ? text : null;
}

function getStellarPrivate(text) {
  return valid.isStellarKey(text) ? text : null;
}
function getStellarPublic(text) {
  return valid.isStellarPublicKey(text) ? text : null;
}

function getSolanaPublic(text) {
  return valid.isSolanaPublicKey(text) ? text : null;
}

function getEthereumPublic(text) {
  return window.WAValidator.validate(text, 'ETH') ? text : null;
}

function getBitcoinPublic(text) {
  return window.WAValidator.validate(text, 'BTC') ? text : null;
}

function getTronPrivate(text) {
  return valid.isTronPrivateKey(text) ? text : null;
}

function getTronPublic(text) {
  return valid.isTronPublicKey(text) ? text : null;
}

const getEmail = (text) => {
  return (valid.isEmail(text)) ? text : null;
}

let oldValue = null;

async function detectEntities(allow, isFirst) {
  try {
    const text = await read();
    if (!isFirst && oldValue == text) return null;    
    oldValue = text;
    const all = {};
    const detected = {};
    all.bitcoinPublic = getBitcoinPublic(text);
    all.bitcoinPrivate = getBitcoinPrivate(text);
    all.ethereumPrivate = getEthereumPrivate(text);
    all.ethereumPublic = getEthereumPublic(text);
    all.solanaPrivate = getSolanaPrivate(text);
    all.solanaPublic = getSolanaPublic(text);
    all.stellarPrivate = getStellarPrivate(text);
    all.stellarPublic = getStellarPublic(text);
    all.tronPublic = getTronPublic(text);
    all.tronPrivate = getTronPrivate(text);
    all.email = getEmail(text);
    if (allow.bitcoinPrivate && all.bitcoinPrivate != null) detected.bitcoinPrivate = all.bitcoinPrivate;
    if (allow.bitcoinPublic && all.bitcoinPublic != null) detected.bitcoinPublic = all.bitcoinPublic;
    if (allow.ethereumPrivate && all.ethereumPrivate != null) detected.ethereumPrivate = all.ethereumPrivate;
    if (allow.ethereumPublic && all.ethereumPublic != null) detected.ethereumPublic = all.ethereumPublic;
    if (allow.solanaPrivate && all.solanaPrivate != null) detected.solanaPrivate = all.solanaPrivate;  
    if (allow.solanaPublic && all.solanaPublic != null) detected.solanaPublic = all.solanaPublic;
    if (allow.stellarPrivate && all.stellarPrivate != null) detected.stellarPrivate = all.stellarPrivate;  
    if (allow.stellarPublic && all.stellarPublic != null) detected.stellarPublic = all.stellarPublic;
    if (allow.tronPublic && all.tronPublic != null) detected.tronPublic = all.tronPublic;
    if (allow.tronPrivate && all.tronPrivate != null) detected.tronPrivate = all.tronPrivate;
    if (allow.email && all.email != null) detected.email = all.email;
    const res = {all, detected};
    return res;  
  } catch (e) {
    return null;
  }  
}

let queryTimeout = null;
const timeout = 500;

async function checkEntities(task, allow, isFirst) {  
  const entities = await detectEntities(allow, isFirst);  
  if(entities == null) return;
  if (Object.keys(entities.detected).length > 0) {
    task.call(`${task.stage}-Clipboard-detected`, entities.detected);
    return entities.detected;
  }
  const [allowFact] = Object.entries(entities.all).filter(i=>i[1]!=null).map(i=>i[0]);
  const allowKey = allowFact ?? 'nothing';
  const fact = textWarningData[allowKey].getText();
  const need = Object.entries(allow).filter(i=>i[1]==true).map(i=>local.getText(textWarningData[i[0]]));
  const lstr = isFirst ? textWarningData.firstTry : textWarningData.wrongAddress
  const text = lstr.format({fact, need});
  task.call(`${task.stage}-Clipboard-not-detected`, text.data);
  return null;
}

async function getClipboardData(task, allow) {  
  return new Promise(async (resolve) => {
    async function entitiesTimeoutHandler() {
      queryTimeout = null;      
      const entities = await checkEntities(task, allow);
      if (entities != null) return resolve(entities);
      queryTimeout = setTimeout(entitiesTimeoutHandler, timeout);
    }
    
    if (queryTimeout != null) clearTimeout();     
    const entities = await checkEntities(task, allow, true);
    if (entities != null) 
      return resolve(entities);
    queryTimeout = setTimeout(entitiesTimeoutHandler, timeout);
  });
}


export async function detect({  
  task,  
  allow,
  backBtn 
}) {  
  if (task == null) throw new Error('task is not defined');  
  if (allow == null) throw new Error('allow is not defined');
  getClipboardData(task, allow);
  if (backBtn) {
    return getBackBtn(task.name, backBtn);
  }
}

export function write(text) {
  if (window.speakease?.writeToClipboard != null)
    return window.speakease.writeToClipboard(text);
  return navigator.clipboard.writeText(text);
}

export async function read() {
  if (window.speakease?.writeToClipboard != null)
    return window.speakease.readFromClipboard();
  return await navigator.clipboard.readText();
}

export function formatDetectedObject(obj) {
  const res = {};
  for (const key in obj) {
    const val = textWarningData[key];
    if (val == null) continue;
    res[key] = {
      key: key,
      blockchain: blockchainMap[key],
      text: val
    }
  }
  return res;
}

export default {
  detect,
  write,
  formatDetectedObject
}