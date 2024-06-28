import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import history from "/components/history/history.js";
import emailTask from "/components/emailRequestTask/emailRequestTask.js";
import activityManager from "/intentions/activityManager/activityManager.js";
import Activity from "/intentions/activityManager/Activity.js";
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import { LocalString } from "/components/local/local.js";
import users from "/components/users/users.js";
import system from "/components/system/system.js";
import { log } from "/intentions/console/console.js";

const localData = {
  success: new LocalString({
    en: `The email has been set as `,
    ru: `Почтовый адрес установлен как `,
    ko: `이메일이 설정되었습니다`,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${value}으로 ${lText}`,
    }
  }),
  noSorry: new LocalString({
    en: `Sorry. Can't save email. Please check your storage access permissions. Say Yes to try save email again`,
    ru: `Не могу сохранить вашу почту. Пожалуйста, проверьте доступ к вашему хранилищу. Скажите Да, чтобы попробовать сохранить почту еще раз`,
    ko: `죄송합니다. 이메일을 저장할 수 없습니다. 저장소 권한을 확인하십시오. 그 다음 "예"라고 말씀하셔서 이메일을 다시 저장하십시오`,
  }),
  title: new LocalString({
    en: `Set user email`,
    ru: `Set user email`,
    ko: `유저 이메일 설정`
  }),

}

class SetEmail extends HTMLElement {
  #email;

  async #saveEmailAndExit(task) {
    try {
      await system.setEmail(this.#email);
      const my = localData.success.format(this.#email);
      log(my.data);
      setTimeout(() => {
        users.gotoHome();
      }, 3000);
    } catch (e) {
      log(localData.noSorry.data);
      task.setStage('requestEmailTask', null, false);
    }
  }

  #task = new Task({
    name: 'Set user email',
    text: {
      en: 'Set user email',
      ru: 'Настроить почту пользователя',
      ko: '유저 이메일 설정'
    }
  }, {
    started: async (task) => {
      task.setStage('requestEmailTask');
    },
    'requestEmailTask': async (task) => {
      const mode = system.hasEmail() ? 'update' : 'create';
      this.#email = await emailTask.request(mode);
      this.#saveEmailAndExit();
    },
    'exit': async (task) => {
      users.gotoHome();
    },
  });
  async #startTask() {
    taskManager.startExclusive(await this.#task);
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    this.#startTask();
  }

  async disconnectedCallback() {
    taskManager.end(this.#task);
    speechR.start();
  }
}

customElements.define("speakease-setemail", SetEmail);

const setEmail = new Activity({
  name: 'setEmail',
  text: new LocalString({
    en: `Set Email`,
    ru: `Установить адрес почты`,
    ko: `이메일 설정`,
    format: (text, name) => `${name}, ${text}`
  }),
  link: '/setEmail.html',
  top: ['activities', 'home'],
  order: 2,
  type: 'general',
  description: new LocalString({
    en:'Set email so we can notify you about updates',
    ru:'Установите адрес электронной почты, тогда мы сможем уведомлять вас об изменениях',
    ko:'이메일을 설정하시면 업데이트 사항을 알려드릴 수 있습니다'
  })
}, {
  check: function () {
    return !system.hasEmail();
  }
});

const updateEmail = new Activity({
  name: 'updateEmail',
  text: new LocalString({
    en: `Update email`,
    ru: `Обновить адрес почты`,
    ko: `이메일 업데이트`,
    format: (text, name) => `${name}, ${text}`
  }),
  link: '/setEmail.html',
  top: ['activities', 'home'],
  order: 18,
  type: 'general',
  description: new LocalString({
    en:'Change you email address if necessary',
    ru:'Смените адрес электронной почты, если необходимо',
    ko:'필요하시면 이메일을 변경하십시오'
  })
}, {
  check: function () {
    const us = users.getUser();
    if (us == null) return false;
    return system.hasEmail();
  }
});

activityManager.start(setEmail);
activityManager.start(updateEmail);