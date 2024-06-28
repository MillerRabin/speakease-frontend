
import { LocalString } from '/components/local/local.js';
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';

const requestMicrophoneText = new LocalString({
  en: "Request for Microphone access permission",
  ru: "Запросить права доступа к микрофону",
  ko: "마이크 접근 요청"
});

const requestStorageText = new LocalString({
  en: "Choose a storage location",
  ru: "Выбрать рабочую папку",
  ko: "저장 위치 선택"

});


let gPerm = null;
let permAliveTimeout = null;
function getPermissionsAliveInterval() {
  if (gPerm == null) return 3000;
  if (!gPerm.isMicrophoneAllowed || !gPerm.isStorageReadable || !gPerm.isStorageWriteable) return 3000;
  return 10000;
}

async function getPermissions() {
  if (gPerm != null) return gPerm;
  gPerm = await getPermissionsInternal();
  const int = getPermissionsAliveInterval();
  permAliveTimeout = setTimeout(() => {
    permAliveTimeout = null;
    gPerm = null;
  }, int);
  return gPerm;
}

export async function getPermissionsInternal() {
  const dma = window.speakease?.getPermissions?.();
  if (dma != null)
    return JSON.parse(dma);
  return {
    isMicrophoneAllowed: await isMicrophoneAllowed(),
    isStorageReadable: true,
    isStorageWriteable: true,
  }
}

async function isMicrophoneAllowed() {
   return await navigator.permissions.query({ name: 'microphone' })
     .then(result => result.state === "granted");
}

async function requestMicrophonePermissions() {
  const func = window.speakease?.requestMicrophonePermissions;
  if(func != null) {
    window.speakease?.requestMicrophonePermissions();
    return await resolvePermissions(perm => perm.isMicrophoneAllowed);
  }
  return  await navigator.mediaDevices.getUserMedia({ audio: true});
}

function resolvePermissions(cb) {
  async function handler(resolve) {
    const delay = 1000;
    const perm = await getPermissions();
    const res = cb(perm);
    if(res) return resolve(perm)
    setTimeout(() => handler(resolve), delay);
  }
  return new Promise(async (resolve) => {
    await handler(resolve);
  });
}

async function pickupFolder() {
  const func = window.speakease?.pickupFolder?.();
  if(func != null)
    return await resolvePermissions(perm => perm.isStorageWriteable && perm.isStorageReadable);
  return await getPermissions();
}

export function microphoneCustomDom(task, stage) {
  const btn = window.document.createElement('button');

  btn.innerText = requestMicrophoneText.getText();
  btn.onclick = () => {
    requestMicrophonePermissions().then(() => {
      btn.disabled = true;
      task.setStage(stage);
    });
  }
  return btn;
}

export function storageCustomDom(task, stage) {
  const btn = window.document.createElement('button');
  btn.innerText = requestStorageText.getText();
  btn.onclick = () => {
    pickupFolder().then(() => {
      btn.disabled = true;
      task.setStage(stage);
    });
  }
  return btn;
}

export async function hasEnoughPermissions() {
  const perm = await getPermissions();
  return perm.isStorageReadable && perm.isStorageWriteable;
}

export async function hasStoragePermissions() {
  const perm = await getPermissions();
  return perm.isMicrophoneAllowed && perm.isStorageReadable && perm.isStorageWriteable;
}

async function permissionActivity() {
  const activity = new Activity({
      name: 'permission',
      text: new LocalString({
        en: 'Set Device Permission',
        ru: 'Дать права устройству',
        ko: '기기 권한 설정',
      }),
      link: '/permission.html',
      top: ['activity'],
      order: 0,
      type: 'critical',
      description: new LocalString({
        en:"I don't have enough device permissions to work. Please grant me necessary permissions",
        ru:"У меня нет необходимых прав для работы на устройстве. Пожалуйста дайте мне необходимые права",
        ko:"기기 권한이 없습니다. 권한을 확인해 주세요",
      })
    }, {
      check: async () => {
        const hp = await hasEnoughPermissions()
        return !hp;
      }
  });
  activityManager.start(activity);
}

function init() {
  permissionActivity();
}

init();

export default {
  getPermissions,
  requestMicrophonePermissions,
  pickupFolder,
  microphoneCustomDom,
  storageCustomDom
}
