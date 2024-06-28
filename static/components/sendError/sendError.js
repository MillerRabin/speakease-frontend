import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import users from '/components/users/users.js';
import errors from '/components/errors/errors.js';
import { log } from "/intentions/console/console.js";
import emailTask from "/components/emailRequestTask/emailRequestTask.js";
import system from "/components/system/system.js";

const localData = {
  gotError: new LocalString({
    en: `
      <span>Error was happend, during execute. Do you want to send it to developers?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="gotError?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="gotError?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Произошла ошибка, при выполнении сценария. Хотите отправить её разработчикам?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="gotError?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="gotError?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>실행 중에 오류가 발생하였습니다. SpeakEase 팀에게 오류 정보를 전송하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="gotError?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="gotError?" postfix="No">아니요</button>
      </div>
    `,
  }),
  commentsQuestion: new LocalString({
    en: `
      <span>Do you want to send your comments to developers?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="commentsQuestion?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="commentsQuestion?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Хотите отправить ваш комментарий разработчикам?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="commentsQuestion?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="commentsQuestion?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>SpeakEase 팀에게 피드백을 보내시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="commentsQuestion?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="commentsQuestion?" postfix="No">아니요</button>
      </div>
    `,
  }),
  errorCommentsConfirm: new LocalString({
    en: `
      <span>Is this correct?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="errorConfirm?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="errorConfirm?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Все правильно?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="errorConfirm?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="errorConfirm?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>전송하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Send error" stage="errorConfirm?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Send error" stage="errorConfirm?" postfix="No">아니요</button>
      </div>
    `,
  }),
  sayComment: new LocalString({
    en: `Please say your comment`,
    ru: `Пожалуйста произнесите ваш комментарий`,
    ko: `피드백을 말씀해 주세요`,
  }),
  sendingFeedback: new LocalString({
    en: `Sending your feedback to developers`,
    ru: `Отправляю ваш отзыв разработчикам`,
    ko: `SpeakEase 팀에게 피드백 전송중`,
  }),
  sendingError: new LocalString({
    en: `Sending error to developers`,
    ru: `Отправляю ошибку разработчикам`,
    ko: `SpeakEase 팀에게 오류 정보 전송중`,
  }),
  thankYou: new LocalString({
    en: `Data sent. Thank you`,
    ru: `Данные отправлены. Спасибо`,
    ko: `전송이 완료되었습니다. 갑사합니다`,
  }),
  cantSendData: new LocalString({
    en: `Cant send error. Please use another channels to connect with developers`,
    ru: `Не могу отправить данные. Пожалуйста используйте другие каналы, чтобы связаться с разработчиками`,
    ko: `전송할 수가 없습니다. 다른 채널을 통하여 SpeakEase 팀에게 문의하십시오`,
  }),
  title: new LocalString({
    en: `Send Error`,
    ru: `Send Error`,
    ko: `오류 전송`
  }),

}

function createErrorDom() {
  const dm = window.document.createElement('span');
  dm.className = 'send-error';
  return dm;
 }

 function createStatusDom() {
  const dm = window.document.createElement('span');
  dm.className = 'signin-user-status'
  return dm;
 }

 function getErrorFromUrl () {
  const params = new URL(window.location);
  const error = params.searchParams.get('error');
  if (error == null) return null;
  try {
    return JSON.parse(window.atob(error));
  } catch (e) {
    return { message: `can't parse error from ${error}`};
  }  
}

 class SendError extends HTMLElement {  
  #errorMessage;
  #error = null;
  #errorDom = createErrorDom();
  #statusDom = createStatusDom();
  #userEmail = null;

  #sendErrorStatus(text) {
    const tDots = text.substr(text.length - 3);
    if (tDots == '...')
      this.#statusDom.classList.add('animated');
    else
      this.#statusDom.classList.remove('animated');
    this.#statusDom.innerHTML = text;
  }

  #sendErrorStatusHandler = (event) => {
    this.#sendErrorStatus(event.data.getText());
  }

  #errorTask = new Task({
    name: 'Send error',
    text: {
      en: 'Send error',
      ru: 'Отправить ошибку',
      ko: '오류 전송',
    }
  }, {
    started: async (task) => {
      if (this.error) {
        task.setStage('gotError?');
      } else {
        task.setStage('commentsQuestion?');
      }
      speechR.start();
    },
    'gotError?': () => {
      const gotError = localData.gotError.data;
      this.#errorDom.innerHTML = this.error.message;
      gotError.customDom = this.#errorDom;
      log(gotError);
    },    
    'gotError?-Yes': (task) => {
      task.setStage('errorMessage?');
    },
    'gotError?-No': (task) => {
      task.setStage('exit');
    },
    'commentsQuestion?': () => {
      log(localData.commentsQuestion.data);
    },
    'commentsQuestion?-Yes': (task) => {
      task.setStage('errorMessage?');
    },
    'commentsQuestion?-No': (task) => {
      if (this.error) {
        task.setStage('errorMessage?');
        return;
      }
      task.setStage('exit');
    },
    'errorMessage?': async () => {
      log(localData.sayComment.data);
    },
    'errorMessage?-Text': async (task, data) => {
      const text = data.text;
      this.#errorMessage = text;
      task.setStage('errorConfirm?');
    },
    'errorConfirm?': () => {
      log(localData.errorCommentsConfirm.data);
    },
    'errorConfirm?-Yes': async (task) => {
      if (system.hasEmail()) {
        task.setStage('sendAndExit');
        return;
      }
      task.setStage('emailRequest');
    },
    'errorConfirm?-No': (task) => {
      task.setStage('errorMessage?');
    },
    'emailRequest': async (task) => {
      this.#userEmail = await emailTask.request();
      task.setStage('sendAndExit');
    },
    'sendAndExit': async (task) => {
      if (this.error) {
        const td = localData.sendingError.data;
        td.customDom = this.#statusDom;
        log(td);
      } else {
        const td = localData.sendingFeedback.data;
        td.customDom = this.#statusDom;
        log(td);
      }      
      try {
        await errors.sendError(this.#errorMessage, this.error, this.#userEmail);            
      } catch (e) {
        task.setStage('error');
        return;
      }            
      task.setStage('exit');
      log(localData.thankYou.data);
    },
    'error': async(task) => {
      log(localData.cantSendData.data);
      task.setStage('exit');
    },
    'exit': async () => {
      setTimeout(() => {
        users.gotoHome();
      }, 3000);      
    }
  });

  #startTask() {
    taskManager.startExclusive(this.#errorTask);
  }
  
  get error() { return this.#error; }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');    
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await speechDispatcher.attachTask(this.#errorTask);    
    errors.on.sendErrorStatus(this.#sendErrorStatusHandler);
    setTimeout(()=> {
      this.#error = getErrorFromUrl();
      this.#startTask();
    }, 0);
  }

  async disconnectedCallback() {    
    speechDispatcher.detachTask(this.#errorTask);
    errors.off.sendErrorStatus(this.#sendErrorStatusHandler);
    taskManager.end(this.#errorTask);
  }
}

customElements.define("speakease-senderror", SendError);
