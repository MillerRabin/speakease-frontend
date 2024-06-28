import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import wallets from "/components/wallets/wallets.js";
import history from "/components/history/history.js";
import system from "/components/system/system.js";
import { LocalString } from "/components/local/local.js";


import speechR from '/intentions/intention-can-interact-with-user/main.js';
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import { log } from "/intentions/console/console.js";
import users from "/components/users/users.js";
import koNLP from "../koNLP/koNLP.js";

const localData = {

  nameInfo: new LocalString({
    en: `Your wallet name is `,
    ru: `Сейчас имя кошелька - `,
    ko: `전자 지갑명은 `,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${value}입니다`,
    }
  }),
  changeNameQuestion: new LocalString({
    en: `Would you like to modify the name of your wallet?`,
    ru: `Вы хотите сменить имя вашего кошелька?`,
    ko: `전자 지갑명을 변경하시겠습니까?`
  }),

  setName: new LocalString({
    en: `How would you like to name your wallet?`,
    ru: `Какое новое имя вашего кошелька?`,
    ko: `전자 \b지갑명을 무엇으로 하시겠습니까?`,
  }),
  confirm: new LocalString({
    en: `Are you confirming that name of your wallet is `,
    ru: `Вы подтверждаете, что новое имя вашего кошелька `,
    ko: `새로운 지갑명을`,
    format: {
      en: (lText, value) => `${lText} ${value} ?`,
      ru: (lText, value) => `${lText} ${value} ?`,
      ko: (lText, value) => `${lText} ${koNLP.addDirectionParticle(value)} 하시겠습니까?`,
    }
  }),
  successName: new LocalString({
    en: `The new name of your wallet has been set as`,
    ru: `Новое имя вашего кошелька `,
    ko: `지갑명을`,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addDirectionParticle(value)} 설정하였습니다`
    }
  }),
  rollback: new LocalString({
    en: `I like your old name`,
    ru: `Мне нравится ваше старое имя`,
    ko: `기존 이름`,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addSubjectParticle(value)} 더 마음에 듭니다`
    },
  }),
  saving: new LocalString({
    en: `Saving your data. Please wait ...`,
    ru: `Сохраняю данные. Пожалуйста подождите...`,
    ko: `데이터를 저장합니다. 잠시만 기다려 주세요 ...`
  }),
  thanks: new LocalString({
    en: `Thank you. I like your new wallet name`,
    ru: `Спасибо. Мне нравится ваше новое имя кошелька`,
    ko: `감사합니다. 새로운 지갑 이름이 마음에 듭니다`
  }),
  title: new LocalString({
    en: `Edit user name`,
    ru: `Edit user name`,
    ko: `유저 이름 편집`
  })
}

class EditName extends HTMLElement {
  #name;
  #userData;

  async #saveDataAndExit() {
    await wallets.renameWallet(this.#userData.id, this.#name)
    window.location.assign('/home.html');
  }

  async #rollbackAndExit() {
    const my = localData.rollback.format(this.#userData.name);
    log(my.data);
    users.gotoHome();
  }

  #editUserName = new Task({
    name: 'Edit user name',
    text: {
      en: 'Edit user name',
      ru: 'Редактирование имя пользователя',
      ko: '유저 이름 편집',
    }
  }, {
    started: async (task) => {
      this.#userData = await this.#getName();
      const data = localData.nameInfo.format(this.#userData.name);
      log(data.data);
      task.setStage('questionToChangeName?');
      speechR.start();
    },
    'questionToChangeName?': async () => {
      const data = localData.changeNameQuestion.data;
      log(data);
    },
    'questionToChangeName?-Yes': async (task) => {
      task.setStage('setName?');
    },
    'questionToChangeName?-No': async () => {
      this.#rollbackAndExit();
    },
    'setName?': async () => {
      const data = localData.setName.data;
      log(data);
    },
    'setName?-Text': async (task, data) => {
      const text = data.text;
      const name = await system.getNameFromText(text);
      if (name == null) return;
      this.#name = name;
      const confirm = localData.confirm.format(name);
      log(confirm.data);
      task.setStage('saveName?', null, false);
    },
    'saveName?-Yes': async(task) => {
      task.setStage('exit', null, false);
    },
    'saveName?-No': (task) => {
      task.setStage('setName?', null, false);
    },
    'exit': async() => {
      const my = localData.successName.format(this.#name);
      log(my.data);
      await this.#saveDataAndExit();
    },
    'Cancel': async(task) => {
      task.failed = true;
      await this.#rollbackAndExit();
    }
  });

  async #getName() {
    try {
      const res = await wallets.get();
      return Object.values(res)[0];

    } catch (e) {
      return null;
    }
  }

  #startTask() {
    taskManager.startExclusive(this.#editUserName);
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await speechDispatcher.attachTask(this.#editUserName);
    this.#startTask();
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#editUserName);
    taskManager.end(this.#editUserName);
    speechR.start();
  }
}

customElements.define("speakease-editname", EditName);
