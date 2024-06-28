import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import system from "/components/system/system.js";
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import { log } from "/intentions/console/console.js";
import users from "/components/users/users.js";
import "/components/taskButton/taskButton.js";
import koNLP from "../koNLP/koNLP.js";

const localData = {
  setName: new LocalString({
    en: `How would you like to name your device?`,
    ru: `Как вы хотите назвать ваше устройство?`,
    ko: `기기명을 무엇으로 하시겠습니까?`
  }),
  setNewName: new LocalString({
    en: `How would you like to name your device?`,
    ru: `Какое новое имя вы хотели бы дать устройству?`,
    ko: `기기명을 무엇으로 하시겠습니까?`
  }),
  myName: new LocalString({
    en: `Device name is `,
    ru: `Имя устройства `,
    ko: `기기명은 `,
    format: {
      en: (lText, value) => `${lText} ${value}.`,
      ru: (lText, value) => `${lText} ${value}.`,
      ko: (lText, value) => `${lText} ${value}입니다.`
    }
  }),
  reName: new LocalString({
    en: `
      <span>Would you like to change device name?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Give me name" stage="newName?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Give me name" stage="newName?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Вы хотите поменять имя устройства?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Give me name" stage="newName?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Give me name" stage="newName?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>기기명을 변경하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Give me name" stage="newName?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Give me name" stage="newName?" postfix="No">아니요</button>
      </div>
    `,
  }),
  confirm: new LocalString({
    en: `
      Are you confirming that the name of your new device is $1?
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Give me name" stage="saveName?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Give me name" stage="saveName?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Вы уверены, что имя устройства будет $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Give me name" stage="saveName?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Give me name" stage="saveName?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      기기명을 $1 하시겠습니까?
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Give me name" stage="saveName?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Give me name" stage="saveName?" postfix="No">아니요</button>
      </div>
    `,
    format: {
      en: (lText, value) => lText.replaceAll('$1', value),
      ko: (lText, value) => lText.replaceAll('$1', koNLP.addDirectionParticle(value)),
    }
  }),
  success: new LocalString({
    en: `The name of your new device has been set as `,
    ru: `Имя вашего нового устройства установлено как `,
    ko: `기기명을 `,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addDirectionParticle(value)} 설정하였습니다`
    }
  }),
  rollback: new LocalString({
    en: `I like my old name`,
    ru: `Мне нравится мое старое имя`,
    ko: `기존 이름`,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addSubjectParticle(value)} 더 마음에 듭니다`,
    },
  }),
  thanks: new LocalString({
    en: `Thank you. I like my new name`,
    ru: `Спасибо. Мне нравится мое новое имя`,
    ko: `감사합니다. 저의 새로운 이름이 마음에 듭니다`
  }),
  noSorry: new LocalString({
    en: `Sorry. Can't save my name. Please check your storage access permissions. Say Yes to try save name again`,
    ru: `Не могу сохранить свое имя. Пожалуйста, проверьте доступ к вашему хранилищу. Скажите Да, чтобы попробовать сохранить имя еще раз`,
    ko: `죄송합니다. 제 이름을 저장할 수 없습니다. 저장소에 대한 접근 권한을 확인하십시오. 이름을 다시 저장하시려면 "예"라고 말씀하십시오.`
  }),
  title: new LocalString({
    en: `Please give me a name`,
    ru: `Please give me a name`,
    ko: `디바이스 이름 설정`
  }),
}

class GiveName extends HTMLElement {
  #name;

  async #saveNameAndExit(task) {
    try {
      await system.setName(this.#name);
      const my = localData.success.format(this.#name);
      log(my.data);
      setTimeout(() => {
        users.gotoHome();
      }, 3000);
    } catch (e) {
      log(localData.noSorry.data);
      task.setStage('saveName?', null, false);
    }
  }

  async #rollbackAndExit() {
    const oldName = await this.#getName();
    const my = localData.rollback.format(oldName).join(localData.thanks);
    log(my.data);
    users.gotoHome();
  }

  #nameTask = new Task({
      name: 'Give me name',
      text: {
        en: 'Give me name',
        ru: 'Дайте мне имя',
        ko: '지갑 이름 설정'
      }
    }, {
      started: async (task) => {
        this.#name = await this.#getName();
        if (this.#name != null) {
          task.setStage('newName?');
          return;
        }
        log(localData.setName.data);
        task.setStage('setName?', null, false);
      },
      'newName?': () => {
        const my = localData.myName.format(this.#name).join(localData.reName);
        log(my.data);
      },
      'newName?-Yes': (task) => {
        log(localData.setNewName.data);
        task.setStage('setName?', null, false);
      },
      'newName?-No': (task) => {
        this.#rollbackAndExit(task);
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
      'saveName?-Yes': (task) => {
        this.#saveNameAndExit(task);
      },
      'saveName?-No': async (task) => {
        this.#name = await this.#getName();
        log(localData.setNewName.data);
        task.setStage('setName?', null, false);
      }
    }
  );

  async #getName() {
    try {
      return await system.getName();
    } catch (e) {
      return null;
    }
  }

  async #startTask() {
    taskManager.startExclusive(this.#nameTask);
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await speechDispatcher.attachTask(this.#nameTask);
    await this.#startTask();
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#nameTask);
    taskManager.end(this.#nameTask);
  }
}

customElements.define("speakease-givename", GiveName);
