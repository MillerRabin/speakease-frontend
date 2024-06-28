import { LocalString } from "/components/local/local.js";
import clipboard from "../clipboard/clipboard.js";
import { log } from "/intentions/console/console.js";
import users from "/components/users/users.js";
import taskManager, { Task } from "/components/taskManager/taskManager.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import valid from "/components/valid/valid.js";
import koNLP from "../koNLP/koNLP.js";
import system from "/components/system/system.js";

const localData = {
  requestEmail: new LocalString({ 
    en: `
      <span>Do you want to give us email for feedback?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="requestEmail?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="requestEmail?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Хотите оставить ваш почтовый адрес для обратной связи?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="requestEmail?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="requestEmail?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>피드백 메일을 SpeakEase 팀에게 전송하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="requestEmail?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="requestEmail?" postfix="No">아니요</button>
      </div>
    `
  }),
  updateEmail: new LocalString({ 
    en: `
      <span>Do you want to update your email?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="requestEmail?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="requestEmail?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Хотите обновить ваш адрес электронной почты?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="requestEmail?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="requestEmail?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>이메일을 변경하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="requestEmail?" postfix="Yes">네</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="requestEmail?" postfix="No">아니오</button>
      </div>
    `,
  }),
  emailDetected: new LocalString({
    en: `I'm detected a email in your clipboard`,
    ru: `Обнаружен емайл в вашем буфере обмена`,
    ko: `클립보드에서 이메일을 감지하였습니다`,
  }),
  emailNotDetected: new LocalString({
    en: `Please copy email into your clipboard`,
    ru: `Пожалуйста, скопируйте ваш емайл в буфер обмена`,
    ko: `클립보드에 이메일 복사하여 주십시오`,
  }),
  emailRequirements: new LocalString({
    en: `Please copy email into clipboard or type in keyboard`,
    ru: `Скопируйте ваш email в буфер обмена или введите с клавиатуры`,
    ko: `클립보드에 이메일을 복사하시거나 키보드를 사용하여 입력하여 주십시오`,
  }),
  savingEmail: new LocalString({
    en: `Updating email`,
    ru: `Обновляю почтовый адрес`,
    ko: `이메일 업데이트`
  }),
  emailConfirm: new LocalString({
    en: `
      <span>Use email $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="emailConfirm?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="emailConfirm?" postfix="No">No</button>
      </div>`,
    ru: `
      <span>Использовать почту $1</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="emailConfirm?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="emailConfirm?" postfix="No">Нет</button>
      </div>`,
    ko: `
      <span>이메일 $1 사용하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Request email" stage="emailConfirm?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Request email" stage="emailConfirm?" postfix="No">아니요</button>
      </div>`,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', koNLP.addObjectParticle(value)),
    }
  }),
}

function createStatusDom() {
  const dm = window.document.createElement('span');
  dm.className = 'signin-user-status'
  return dm;
}

function createState() {
  let resolver = null;
  let rejecter = null;
  const state = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  return {
    promise: state,
    resolve: resolver,
    reject: rejecter
  }
}

class RequestEmailTask {  
  #statusDom = createStatusDom();
  #state;
  #email;
  #action = 'update';

  #updateUserStatus(text) {
    const tDots = text.substr(text.length - 3);
    if (tDots == '...')
      this.#statusDom.classList.add('animated');
    else
      this.#statusDom.classList.remove('animated');
    this.#statusDom.innerHTML = text;
  }

  #updateUserStatusHandler = (event) => {
    this.#updateUserStatus(event.data.status.getText());
  }
  
  #requestEmail = new Task({
    name: 'Request email',
    text: {
      en: 'Request email',
      ru: 'Запросить почту',
      ko: '메일 요청',
    }
  }, {
    started: async (task) => {
      this.#email = null;
      if (this.#action == 'create')
        return task.setStage('email-request-copy-start');
      if (this.#action == 'update')
        return task.setStage('requestEmail?', 'update', false);
      const user = users.getUser();
      if (user?.email) { 
        this.#email = user.email;
        task.setStage('completed');
        return;
      }
      task.setStage('requestEmail?');
    },
    'requestEmail?': async (task, value) => {
      const ld = value == 'update' ? localData.updateEmail.data : localData.requestEmail.data
      await log(ld);
    }, 
    'requestEmail?-Yes': async (task) => {
      task.setStage('email-request-copy-start');
    },
    'requestEmail?-No': (task) => {
      task.setStage('cancelled');
    },
    'email-request-copy-start': async (task) => {
      await log(localData.emailRequirements.data);
      await clipboard.detect({task, allow: { email: true }});
    },
    'email-request-copy-start-Clipboard-not-detected': async (task, entities) => {
      await log(entities);
    },
    'email-request-copy-start-Text': async(task, data) => {
      const text = data.text;
      const email = valid.getEmailFromText(text);
      if (email)
        return task.setStage('emailConfirm?', email);
    },
    'email-request-copy-start-Clipboard-detected': async (task, entities) => {
     await log(localData.emailDetected.data);
     return task.setStage('emailConfirm?', entities.email);
    },
    'emailConfirm?': async (task, email) => {
      const fd = localData.emailConfirm.format(email);
      await log(fd.data);
      this.#email = email;
    },
    'emailConfirm?-Yes': async (task) => {
      task.setStage('saveEmail');
    },
    'emailConfirm?-No': async (task) => {
      this.#email = null;
      task.setStage('email-request-copy-start');
    },
    'saveEmail': async (task) => {      
      const td = localData.savingEmail.data;
      td.customDom = this.#statusDom;
      await log(td);
      if (this.#action == 'update') {
        system.setEmail(this.#email);
        await users.update({ email: this.#email });
      }
      taskManager.end(task);
    },
    'completed': async () => {
      this.#state.resolve(this.#email);
    },
    'cancelled': async (_, value) => {
      this.#state.reject(value);
    }
  });

  async request(action = 'update') {
    this.#action = action;
    try {
      const user = users.getUser();
      if (user == null && action == 'update') return null;
      await speechDispatcher.attachTask(this.#requestEmail);    
      users.on.userChanges(this.#updateUserStatusHandler);
      taskManager.start(this.#requestEmail);
      if (this.#state == null || action == 'update')
        this.#state = createState();
      return await this.#state.promise;
    } finally {
      users.off.userChanges(this.#updateUserStatusHandler);
      speechDispatcher.detachTask(this.#requestEmail);
    }    
  }   
}

const task = new RequestEmailTask();
export default task;