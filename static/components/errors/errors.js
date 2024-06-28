import system from '/components/system/system.js'
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import { LocalString } from '/components/local/local.js';
import { storage, IntentionInterface } from "/intentions/main.js";
import router from "/components/router/router.js";
import version from '/components/system/version.js';

const reportActivityName = 'Send Error';
const sendErrorChanges = 'send-error.changes';
const maxTry = 5;
const localData = {
  gatheringSystemInfo: new LocalString({ en: 'Gathering system info...', ru: 'Собираю информацию о системе...', ko: '시스템 정보 수집 중...' }),
  connecting: new LocalString({ en: 'Connecting...', ru: 'Подключаюсь...', ko: '연결 중...' }),
  sendingData: new LocalString({ en: 'Sending data...', ru: 'Отправляю данные...', ko: '데이터 전송 중...' }),
  dataSent: new LocalString({ en: 'Data sent', ru: 'Данные отправлены', ko: '데이터 전송됨' }),
  cantConnect: new LocalString({ en: `Can't connect`, ru: 'Не могу подключиться', ko: '연결할 수 없음' })
}

const createErrorInterface = IntentionInterface.from(storage, {
  title: {
    en: 'Send feedback to developers',
    ru: 'Нужен сервис по отправке сообщений разработчикам',
    ko: '개발자에게 피드백 전송',
  },
  input: 'Confirm',
  output: 'SendReport'
});

function createActivity() {
  const activity = new Activity({
    name: reportActivityName,
    text: new LocalString({
      en: `Send feedback to SpeakEase team`,
      ru: `Отправить ошибку команде разработчиков SpeakEase`,
      ko: `SpeakEase 팀에게 피드백 보내기`,
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/sendError.html',
    order: 100,
    type: 'developer',
    top: ['home'],
    description: new LocalString({
      en:'If you want to send messages to developer with error description, say send error',
      ru:'Если вы хотите отправить сообщение об ошибке разработчику произнесите - отправить ошибку разработчикам',
      ko:'SpeakeEase 팀에게 피드백 메세지를 전송하시려면 다음과 같이 말씀해 주세요 - 피드백 전송 '
    })
  }, {
    check: function () {
      if (!system.hasName()) return false;
      return true;
    }
  });
  activityManager.start(activity);
  return activity;
}


async function init() {
  try {
    createActivity();
  }
  catch (e) {
    console.log(e);
  }
}

init();

const sendError = async (userComment, error = null, email = null) => {
  updateErrorStatus(localData.gatheringSystemInfo);
  const { androidSystemInfo, ...system_info } = version.getSystemInfo();
  system_info.androidSystemInfo = androidSystemInfo ? JSON.parse(androidSystemInfo) : null;
  if (email) { 
    system_info.email = email;
    userComment = `${userComment} ${email}`
  }
  for (let i = 0; i < maxTry; i++) {
    updateErrorStatus(localData.connecting);
    try {
      await createErrorInterface.ready;
      updateErrorStatus(localData.sendingData);
      const res = await createErrorInterface.send({
        message: JSON.stringify({ userComment, error }),
        system_info: JSON.stringify(system_info),
      });
      updateErrorStatus(localData.dataSent);
      return res;
    } catch (e) {
      if (i == maxTry - 1)
        throw e;
    }
  }
}

function getErrorEncoded(error, taskName) {
  return window.btoa(JSON.stringify({
    taskName,
    message: error.message,
    stackTrace: error?.stack?.substring(0, 30) || null,
    ...error
  }));
}

export function gotoFeedback(error, taskName) {
  setTimeout(() => {
    if (error != null) {
      const estr = getErrorEncoded(error, taskName);
      router.goto(`/sendError.html?error=${estr}`, null, false);
      return;
    }
    router.goto(`/sendError.html`, null, false);
  }, 0)
}

const eventTarget = new EventTarget();

function onSendErrorStatus(callback) {
  eventTarget.addEventListener(sendErrorChanges, callback);
}

function offSendErrorStatus(callback) {
  eventTarget.removeEventListener(sendErrorChanges, callback);
}

function updateErrorStatus(data) {
  const event = new Event(sendErrorChanges);
  event.data = data;
  eventTarget.dispatchEvent(event);
}


export default {
  sendError,
  gotoFeedback,
  on: {
    sendErrorStatus: onSendErrorStatus
  },
  off: {
    sendErrorStatus: offSendErrorStatus
  }
}
