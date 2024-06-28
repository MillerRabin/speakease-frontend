import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import router from "/components/router/router.js";
import system from "/components/system/system.js";
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import speechDispatcher from "../speechDispatcher/speechDispatcher.js";
import users from "/components/users/users.js";
import voiceDataRequestTask from "/components/voiceDataRequestTask/voiceDataRequestTask.js";
import { log } from "/intentions/console/console.js";
import wallets from "/components/wallets/wallets.js";
import { createButtons } from "/components/factories/createButtons.js";

const localData = {
  updateVoiceWish: new LocalString({
    en: `<span>Do you want to update voice sample?</span>
      ${createButtons('Update voice data', 'updateVoice?', {yes: 'Yes', no: 'No'})}`,
    ru: `<span>Вы хотите изменить запись голоса?</span>
      ${createButtons('Update voice data', 'updateVoice?', {yes: 'Да', no: 'Нет'})}`,
    ko: `<span>음성 샘플을 업데이트 하시겠습니까?</span>
      ${createButtons('Update voice data', 'updateVoice?', {yes: '예', no: '아니요'})}`
  }),
  saving: new LocalString({
    en: `Saving your data. Please wait ...`,
    ru: `Сохраняю данные. Пожалуйста подождите...`,
    ko: `데이터를 저장중입니다. 잠시만 기다려 주세요...`
  }),
  notAuthorized: new LocalString({
    en: `You are not authorized`,
    ru: `Вы не авторизованы`,
    ko: `권한이 없습니다`,
  }),
  askForPinCode: new LocalString({
    en: `Please speak or type your current password`,
    ru: `Пожалуйста, произнесите или наберите текущий пароль`,
    ko: `비밀번호를 말씀해 주세요`
  }),
  wrongPinCode: new LocalString({
    en: `Wrong password! Try again.`,
    ru: `Некорректный пароль! Попробуйте еще раз`,
    ko: `잘못된 비밀번호입니다! 다시 시도해 주세요`,
    format: (lText, value) => `${value}, ${lText}`
  }),
  title: new LocalString({
    en: `Update your voice data`,
    ru: `Update your voice data`,
    ko: `유저 음성 데이터 업데이트`
  }),
};

function createActivity() {
  const activity = new Activity({
    name: 'updateVoice',
    text: new LocalString({
      en: `Change voice sample`,
      ru: `обнови мой образец голоса`,
      ko: `음성 샘플 바꾸기`,
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/updateVoice.html',
    order: 20,
    type: 'general',
    notVisibleAt: ['settings'],
    description: new LocalString({
      en:`If you can't login by voice, update your voice sample`,
      ru:'Если вы не можете залогиниться по голосу, обновить голосовой семпл',
      ko:'음성으로 로그인이 되지 않는다면, 음성 샘플을 업데이트하십시오',
    })
  }, {
    check: function () {
      if (!system.hasName()) return false;
      const user = users.getUser();
      if (!user) return false;
      return true;
    }
  });
  activityManager.start(activity);
  return activity;
}

createActivity();

function createStatusDom() {
  const dm = window.document.createElement('span');
  dm.className = 'signin-user-status'
  return dm;
 }

class UpdateVoice extends HTMLElement {
  #name;
  #voiceRecord;
  #statusDom = createStatusDom();
  #wallet;

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
 
  async #getWallet() {
    try {
      const wl = await wallets.get();
      return Object.values(wl)[0];
    } catch (e) {
      return null;
    }
  }

  async #verifyPinCode(text) {
    return await wallets.verifyPinCode(this.#wallet, text);
  }



  async #saveDataAndExit() {
    await users.register({ voiceData: this.#voiceRecord, userName: this.#name });
    router.goto(`/home.html`);
  }

  #uvTask = new Task({
      name: 'Update voice data',
      text: {
        en: 'Update your voice data',
        ru: 'Обновить голосовые данные.',
        ko: '음성 데이터 업데이트',
      }
    }, {
      started: async (task) => {
        this.#wallet = await this.#getWallet();
        task.setStage('updateVoice?');
      },
      'updateVoice?': () => {
        log(localData.updateVoiceWish.data);
      },
      'updateVoice?-Yes': (task) => {
        task.setStage('verifyPinCode?');
      },
      'updateVoice?-No': (task) => {
        this.#rollbackAndExit(task);
      },
      'verifyPinCode?': () => {
        log(localData.askForPinCode.data);
      },
      'verifyPinCode?-Text': async (task, data) => {
        const text = data.text;
        if (await this.#verifyPinCode(text)) {
          task.setStage('setSample');
          return;
        }
        const textConsole = localData.wrongPinCode.format(text);
        log(textConsole.data);
        task.setStage('verifyPinCode?');
      },
    'setSample': async () => {
      this.#voiceRecord = await voiceDataRequestTask.request();
      const td = localData.saving.data;
      td.customDom = this.#statusDom;
      log(localData.saving.data);
      await this.#saveDataAndExit();
    }
  });

  async #getName() {
    const user = users.getUser();
    if (user == null)
      throw new Error('user is not authorized');
    this.#name = user.userName;
  }

  async #startTask() {
    taskManager.startExclusive(this.#uvTask);
  }

  async #rollbackAndExit(task) {
    taskManager.end(task);
    users.gotoHome();
  }

  async connectedCallback() {
    try {
      history.setUIEnabled(false, 'history');
      this.components = {};
      breadcrumbs.setTitle(localData.title.getText());
      await speechDispatcher.attachTask(this.#uvTask);
      this.#getName();
      await this.#startTask();
      users.on.userChanges(this.#updateUserStatusHandler);
    } catch (e) {
      console.error(e);
      await log(localData.notAuthorized.data);
      setTimeout(() => users.gotoHome(), 3000);
    }

  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#uvTask);
    users.off.userChanges(this.#updateUserStatusHandler);
    taskManager.end(this.#uvTask);
  }
}

customElements.define("speakease-updatevoice", UpdateVoice);
