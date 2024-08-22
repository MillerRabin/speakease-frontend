import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import wallets from "/components/wallets/wallets.js";
import system from "/components/system/system.js";
import { LocalString } from '/components/local/local.js';
import { storage, IntentionInterface, generateUUID } from "/intentions/main.js";
import token from '/components/token/token.js';
import header from '/components/header/header.js';
import fs from '/components/fs/fs.js'
import router from '/components/router/router.js';
import loader from '/components/loader/loader.js';
import { getProperty } from '../settings/settings.js';
import CacheFunction from '/components/cacheFunction/cacheFunction.js';

export const signInActivity = 'signIn';
const userChanges = 'users.changes'
const maxTry = 5;

const localData = {
  connecting: new LocalString({ en: 'Connecting...', ru: 'Идет подключение...', ko: '연결 중...' }),
  uploading: new LocalString({ en: 'Uploading voice data...', ru: 'Загружаю голосовые данные...', ko: '음성 데이터 업로드 중...' }),
  updating: new LocalString({ en: 'Updating user data...', ru: 'Обновляю пользовательские данные...', ko: '유저 데이터 업데이트 중...' }),
  updated: new LocalString({ en: 'User data updated', ru: 'Пользовательские данные обновлены', ko: '유저 데어터 업데이트됨' }),
  checking: new LocalString({ en: 'Cheсking voice data...', ru: 'Проверяю голосовые данные...', ko: '음성 데이터 확인 중...' }),
  notDetected: new LocalString({ en: 'User is not detected', ru: 'Пользователь неопределен', ko: '유저 정보를 찾을 수 없습니다' }),
  tooLow: new LocalString({ en: 'Voice not recognized', ru: 'Голос не опознан', ko: '음성이 일치하지 않습니다' }),
  detected: new LocalString({ en: 'User detected', ru: 'Пользователь распознан', ko: '유저를 찾았습니다' }),
  cantConnect: new LocalString({ en: `Can't connect`, ru: 'Не могу подключиться', ko: '연결할 수 없습니다' }),
  registering: new LocalString({ en: `Remembering user's voice...`, ru: 'Запоминаю голос пользователя', ko: '유저의 음성을 기억하는 중...' }),
  registered: new LocalString({ en: `Voice saved`, ru: 'Голос запомнен', ko: '음성이 저장되었습니다' })
}

function createActivity() {
  const activity = new Activity({
    name: signInActivity,
    text: new LocalString({
      en: `log in`,
      ru: `впусти меня`,
      ko: `로그인`,
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/signIn.html',
    order: 1,
    top: ['activities'],
    type: 'general',
    description: new LocalString({
      en:'For wallet access, you can either speak "Log in" or manually type it in.',
      ru:'Для доступа к кошельку вы можете как произнести фразу - Впусти меня, так и напечатать ее',
      ko:'전자 지갑에 접속 하시려면 다음과 같이 말씀해 주십시오 - 로그인.',
    })
  }, {
    check: function () {
      const hn = system.hasName();
      const hw = wallets.has();
      if (!hn || !hw) return false;
      const user = getUser();
      if (user) return false;
      return true;
    }
  });
  activityManager.start(activity);
  return activity;
}


const authService = IntentionInterface.from(storage, {
  title: {
    en: 'Need registration service',
    ru: 'Нужен сервис регистрации',
    ko: '등록 서비스 필요'
  },
  input: 'Token',
  output: 'AuthService'
});

const maxUploadTry = 5;
async function uploadVoiceData(deviceId, blob) {
  for (let i = 0; i < maxUploadTry; i++) {
    try {
      const { url, status } = await fetch(
        `https://storage.int-t.com/voice-data/${deviceId}/${generateUUID()}.wav`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "audio/wav",
          },
          body: blob
        }
      );
      return { url, status };
    }
    catch (e) {
      if (i == maxUploadTry - 1)
        throw e;
      await loader.sleep(2000);
    }
  }
}

export async function register({
  voiceData = () => { throw new Error('voiceData is not defined') },
  userName = () => { throw new Error('userName is not defined') },
  email
}) {
  for (let i = 0; i < maxTry; i++) {
    try {
    updateUserStatus({ status: localData.connecting, user: null });
    const deviceId  = system.getDeviceId();
    await authService.ready;
    updateUserStatus({ status: localData.uploading, user: null });
    const { url } = await uploadVoiceData(deviceId, voiceData);
    updateUserStatus({ status: localData.registering, user: null });
    const td = await authService.register({ deviceId, voiceUrl: url, userName, email });
    const user = token.parse(td.token);
    updateUserStatus({ status: localData.registered, user, token: td.token });
    return user;
    } catch (e) {
      if (i == maxTry - 1)
        throw e;
    }
  }
}

export async function update({...fields}) {
  for (let i = 0; i < maxTry; i++) {
    try {
      updateUserStatus({ status: localData.connecting });
      await authService.ready;
      const user = getUser();
      updateUserStatus({ status: localData.updating });
      const response = await authService.update({id: user.id, ...fields});
      if ('email' in fields) {
        wallets.setEmail(user.id, fields.email);
      }
      updateUserStatus({ status: localData.updated });
      return response;
    } catch (e) {
      if (i == maxTry - 1)
        throw e;
    }
  }
}

function saveToken(token) {
  fs.save('token', token); 
  getUserCached.clear();
}

export async function login({
  voiceData = () => { throw new Error('voiceData is not defined') },
}) {
  for (let i = 0; i < maxTry; i++) {
    try {
      updateUserStatus({ status: localData.connecting, user: null });
      const deviceId  = system.getDeviceId();
      await authService.ready;
      updateUserStatus({ status: localData.uploading, user: null });
      const { url } = await uploadVoiceData(deviceId, voiceData);
      updateUserStatus({ status: localData.checking, user: null });
      const distance = getProperty('distanceThreshold') ?? undefined;
      const meanLowLimit = getProperty('meanThreshold') ?? undefined;

      const td = await authService.login({ deviceId, voiceUrl: url, meanLowLimit, distance});

      if (td == null) {
        updateUserStatus({ status: localData.notDetected, user: null });
        return null;
      }
      if (td.token == null) {
        updateUserStatus({ status: localData.tooLow, user: null });
        console.log('Voice result is too low', td.voiceResult);
        return null;
      }

      saveToken(td.token);      
      console.log('User logged in voice result is', td.voiceResult);
      const user = setUser(token.parse(td.token));
      updateUserStatus({ status: localData.detected, user });
      return user;
    } catch (e) {
      console.log(e);
      if (i == maxTry - 1) {
        updateUserStatus({ status: localData.cantConnect, user: null });
        return null;
      }
    }
  }
}

async function init() {
  try {
    createActivity();
  }
  catch (e) {
    console.error(e);
  }
}

export async function setPinCode(pinCode) {
  if (pinCode == null) throw new Error(`pinCode can't be null`);
  const user = getUser();
  return await wallets.setPinCode(user.id, pinCode);
}


function iGetUser(user) {
  function load() {
    const td = fs.load('token');
    if (td == null) return null;
    return token.parse(td);    
  }
    
  const tUser = user ?? load();
  if (tUser == null) return null;  
  let tWallet = wallets.getWalletByUser(tUser);
  if (tUser.email == null)
    tUser.email = tWallet.email;
  if ((tUser.email != null) && (tWallet.email != tUser.email)) 
    tWallet = wallets.setEmail(tUser.id, tUser.email);  
  return { ...tUser,  wallet: tWallet };
}

const getUserCached = new CacheFunction((user) => {  
  const rUser = iGetUser(user);
  header.setAuth(rUser);
  return rUser;
}, 1000);

function getUser(user) {
  return getUserCached.call(user);
}

export function gotoHome() {
  const user = getUser();
  if (user == null) {
    router.goto('/');
    return;
  }
  router.goto('/home.html');
  return;
}

function setUser(user) {
  getUserCached.clear();
  const rUser = getUser(user);
  header.setAuth(rUser);
  return rUser;
}

function logout() {
  fs.remove('token');
  getUserCached.clear();
  setUser(null);
}

async function save({
  userName,
  voiceRecord,
  pinCode,
  keys,
}) {
  if (userName == null) throw new Error('userName expected');
  if (voiceRecord == null) throw new Error('voiceRecord expected');
  if (pinCode == null) throw new Error('pinCode expected');
  if (keys == null) throw new Error('keys expected');
  const email = system.getEmail();
  const user = await register({ voiceData: voiceRecord, userName: userName, email });
  await wallets.set(user.id, userName, pinCode, keys);
  setUser(user);
}


const eventTarget = new EventTarget();

function onUserChanges(callback) {
  eventTarget.addEventListener(userChanges, callback);
}

function offUserChanges(callback) {
  eventTarget.removeEventListener(userChanges, callback);
}

function updateUserStatus(data) {
  const event = new Event(userChanges);
  event.data = data;
  eventTarget.dispatchEvent(event);
}

init();

export default {
  save,
  register,
  login,
  update,
  getUser,
  setUser,
  logout,
  gotoHome,
  on: {
    userChanges: onUserChanges
  },
  off: {
    userChanges: offUserChanges
  }
}
