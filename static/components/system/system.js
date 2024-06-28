import safe from '/components/safe/safe.js';
import fs from '/components/fs/fs.js';
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import local from '../local/local.js';
import intentions, { generateUUID } from '/intentions/main.js';
import { addEntities } from "/intentions/entities/entities.js";
import entityServer from "/intentions/entityServer/entityServer.js";
import { storage } from "/intentions/main.js";
import { check } from "/intentions/activityManager/activityManager.js";
import users from '/components/users/users.js';
import '/intentions/listening/listening.js';
import '/components/rememberMe/rememberMe.js';
import { getProperty, setProperty } from "/components/settings/settings.js";
import CacheFunction from "/components/cacheFunction/cacheFunction.js";

const { LocalString } = local;
const focusEvent = 'system.focus';
let focusTimeout = null;
let calledTimeout = null;
let dispatchingTimeout = null;
const blinkingTimeout = 1000;
const focusInterval = 10000;
const calledInterval = 1000;
const dispatchingInterval = 2000;

const gFocusMode = {
  focused: false,
  called: false,
  listening: false,
  dispatching: false,
  blinking: false
}

const getNameCached = new CacheFunction(() => {
  const name = fs.load('name')
  safe.mustBeNonEmptyString(name);  
  return name;
})


export function getName() {
  return getNameCached.call(); 
}

const getEmailCached = new CacheFunction(() => {
  const email = fs.load('email')
  safe.mustBeNonEmptyString(email);
  return email;
});


export function getEmail() {
  return getEmailCached.call();
}

export async function setName(name) {  
  safe.mustBeNonEmptyString(name);
  const cName = name.trim();
  getNameCached.clear();
  if (!fs.save('name', cName))
    throw new Error(`Can't save name`);  
  broadcastName();
}

export async function setEmail(email) {
  safe.mustBeNonEmptyString(email);
  const cEmail = email.trim();
  getEmailCached.clear();
  if (!fs.save('email', cEmail))
    throw new Error(`Can't save name`);
  return true;
}

export function hasEmail() {
  try {
    getEmail();
    return true;
  } catch (e) {
    return false;
  }
}

export function hasName() {
  try {
    getName();
    return true;
  } catch (e) {
    return false;
  }
}

export async function getNameFromText(text) {
  safe.mustBeNonEmptyString(text);
  const arr = text.split(/[\s\t]+/g);
  const name = arr.slice(0, 3).join(' ');
  return name;
}

let id = null;
export function getDeviceId() {
  if (id != null) return id;
  const oid = fs.load('id')
  if (!safe.isEmpty(oid)) {
    id = oid;
    return oid;
  }
  const cid = generateUUID();
  if (!fs.save("id", cid)) throw new Error(`Can't save uuid`);
  id = cid;
  return id;
}

async function nameActivity() {
  const activity = new Activity({
      name: 'giveName',
      text: new LocalString({
        en: 'Set Device Name',
        ru: 'Дать имя устройству',
        ko: '기기 이름 설정'
      }),
      link: '/giveName.html',
      top: ['activities'],
      order: 0,
      type: 'general',
      description: new LocalString({
        en:`
          <p>Welcome to SpeakEase</p> 
          <p>Let's configure your settings to personalize your voice experience.</p> 
          <p>Follow the steps to unlock voice-enabled convenience with SpeakEase</p>
        `,
        ru:`<p>Добро пожаловать в SpeakEase</p>
            <p>Необходимо произвести настройки для персонализации голосовых команд</p> 
            <p>Шаг за шагом мы настроим SpeakEase для понимания ваших команд</p>
        `,
        ko:`<p>SpeakEase에 오신 것을 환영합니다</p> 
            <p>SpeakEase 음성 기능을 사용하려면 음성 맞춤 설정을 해야합니다.</p> 
            <p>SpeakEase의 편리한 음성 기능을 사용하기 위해 다음 단계를 따라주세요</p>
        `
      })
    }, {
      check: async () => {
        return !hasName();
      }
  });
  activityManager.start(activity);
}

async function changeNameActivity() {
  const activity = new Activity({
      name: 'changeName',
      text: new LocalString({
        en: 'Change Device Name',
        ru: 'Сменить имя устройства',
        ko: '디바이스 이름 변경'
      }),
      link: '/giveName.html',
      notVisibleAt: ['settings'],
      order: 15,
      type: 'general',
      description: new LocalString({
        en:`If you don't like my name you can change it`,
        ru:'Если вам не нравится мое имя, то смените его',
        ko:`제 이름이 마음에 드시지 않는다면 변경할 수 있습니다`,
      })
    }, {
      check: async () => {      
        if (!hasName()) return false;        
        const user = users.getUser();
        if (user == null) return false;                
        return true;
      }
  });
  activityManager.start(activity);
}

async function focusActivity() {
  const activity = new Activity({
      name: 'focus',
      text: new LocalString({
        en: 'Focus',
        ru: 'Фокус',
        ko: '포커스',
        format: (text, name) => `${name}, ${text}`
      }),
      link: () => {
        setListening(true);
        check()
      },
      top: ['home'],
      order: 0,
      type: 'info',
      description: new LocalString({
        en:'Set focus mode to keep me focused on your commands',
        ru:'Установите режим фокуса, чтобы держать меня в фокусе',
        ko:'명령에 집중할 수 있도록 포커스 모드 설정',
      })
    }, {
      check: function () {
        if (!hasName()) return false;
        if (gFocusMode.listening) return false;
        return true;
      }
  });
  activityManager.start(activity);
}

async function blurActivity() {
  const activity = new Activity({
      name: 'blur',
      text: new LocalString({
        en: 'Relax',
        ru: 'Расслабься',
        ko: '포커스 해제',
        format: (text, name) => `${name}, ${text}`
      }),
      link: () => {
        setListening(false);
        check();
      },
      order: 2,
      type: 'info',
      description: new LocalString({
        en: `Remove focus mode. I'll stop listening you untill you call me by name`,
        ru: 'Сбросьте режим фокуса. Я не буду вас слушать пока вы меня не позовете',
        ko: `포커스 모드를 해제합니다. 명령어를 사용하기 전 저의 이름을 부르셔야 합니다`,
      })
    }, {
      check: function () {
        if (!hasName()) return false;
        if (!gFocusMode.listening) return false;
        return true;
      }
  });
  activityManager.start(activity);
}

function init() {
  nameActivity();
  changeNameActivity();
  broadcastName();
  focusActivity();
  blurActivity();
}

function broadcastName() {
  if (!hasName()) return;
  const name = getName();
  const cLang = local.get();
  const word = {};
  word[cLang.ui] = name;
  const nameEntity = [
    {
      type: 'type',
      key: getDeviceId(),
      name: {
        general: 'Name',
        en: 'Name',
        ru: 'Имя',
        ko: '이름'
      },
      value: {
        name: name,
        system: getDeviceId(),
      },
      words: [word]
    }
  ];
  addEntities(nameEntity);
}

function checkName(parameters) {
  const name = intentions.getParameterByName(parameters, 'Name');
  if (name == null) return true;
  if ((gFocusMode.listening || gFocusMode.focused) && (name.value == null)) return true;
  return compareName(name);
}

function compareName(entity) {
  if (entity == null) return false;
  if (!hasName()) return true;
  const tName = getDeviceId();
  if (entity.value?.system == tName) return true;
  if (entity.value?.system == 'all') return true;
  return false;
}

setTimeout(() => {
  init();
}, 0);


function refreshCalledTimeout() {
  clearTimeout(calledTimeout);
  calledTimeout = setTimeout(offCalled, calledInterval);
}

function refreshFocusTimeout() {
  if (!gFocusMode.focused) return;
  clearTimeout(focusTimeout);
  focusTimeout = setTimeout(offFocus, focusInterval);
}

function offCalled() {
  gFocusMode.called = false;
  updateFocus(gFocusMode);
}

function offFocus() {
  gFocusMode.focused = false;
  updateFocus(gFocusMode);
}

entityServer.on.entity(function (event) {
  const entities = event.data;
  const name = intentions.getEntityByName(entities, 'Name');
  refreshFocusTimeout();
  if (compareName(name))
    focus();
});

function focus() {
  gFocusMode.called = true;
  refreshCalledTimeout();
  gFocusMode.focused = true;
  refreshFocusTimeout();
  updateFocus(gFocusMode);
}

const eventTarget = new EventTarget();

function onFocused(callback) {
  eventTarget.addEventListener(focusEvent, callback);
}

function offFocused(callback) {
  eventTarget.removeEventListener(focusEvent, callback);
}

function updateFocus(data) {
  const event = new Event(focusEvent);
  event.data = data;
  eventTarget.dispatchEvent(event);
}

function getFocusMode() {
  return gFocusMode;
}

function setListening(value) {
  gFocusMode.listening = value;
  updateFocus(gFocusMode);
  setProperty('focus', value);
}

function setDispatching(value) {
  gFocusMode.dispatching = value;
  clearTimeout(dispatchingTimeout);
  if (value) {
    dispatchingTimeout = setTimeout(() => {
      gFocusMode.dispatching = false;
      updateFocus(gFocusMode);
    }, dispatchingInterval);
  }
  updateFocus(gFocusMode);
}

function setBlinking(value) {
  gFocusMode.blinking = value;
  clearTimeout(blinkingTimeout);
  if (value) {
    dispatchingTimeout = setTimeout(() => {
      gFocusMode.blinking = false;
      updateFocus(gFocusMode);
    }, dispatchingInterval);
  }
  updateFocus(gFocusMode);
}

function createIntentions() {
  storage.createIntention({
    title: {
      en: 'Listening'
    },
    input: 'None',
    output: 'ListeningResult',
    onData: async function onData(status, intention) {
      if (status != 'data') return;
      intention.send('completed', this, { success: true });
      if (!checkName(intention.parameters)) return;
      await check();
      switch (intention.value) {
        case "startListening":
          setListening(true);
          return;
        case "stopListening":
          setListening(false);
          return;
      }
    }
  });
}

createIntentions();

setTimeout(() => {
  const setting = getProperty('focus') ?? false;
  setListening(setting);
}, 100);

export default {
  getDeviceId,
  getName,
  hasName,
  setName,
  getEmail,
  hasEmail,
  setEmail,
  getNameFromText,
  checkName,
  getFocusMode,
  setListening,
  setDispatching,
  setBlinking,
  on: {
    focused: onFocused
  },
  off: {
    focused: offFocused
  }
}
