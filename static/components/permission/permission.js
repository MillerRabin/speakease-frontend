import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import permissions from "/components/permissions/permissions.js";
import users from "/components/users/users.js";
import { log } from  "/intentions/console/console.js";

const localData = {
  setMicPermissions: new LocalString({
    en: `Microphone access needed`,
    ru: `Мне нужен доступ к микрофону`,
    ko: `마이크 접근이 필요합니다`,
  }),
  setStoragePermissions: new LocalString({
    en: `Please select a writable storage location. You have the option to utilize your existing SpeakEase directory, and your wallet data will be seamlessly imported.`,
    ru: `Пожалуйста, выберите рабочую папку с правом на чтение и запись. Если укажете папку с предыдущей установки все файлы буду импортированы`,
    ko: `쓰기 가능한 저장 공간 위치를 선택하십시오. 기존 SpeakEase 디렉토리를 지정하시면 기존 지갑 데이터를 사용하실수 있습니다.`
  }),
  thankyou: new LocalString({
    en: `All permissions is set. Thank you`,
    ru: `Все права установлены. Спасибо`,
    ko: `모든 권한이 허용되었습니다. 감사합니다`
  }),
  title: new LocalString({
    en: `Device permission`,
    ru: `Device permission`,
    ko: `디바이스 권한`
  }),

}

class Permission extends HTMLElement {
  #console;
  #entityServer;

  #permissionTask = new Task({
      name: 'Set device permission',
      text: {
        en: 'Set device permission',
        ko: '디바이스 권한 설정',
      }
    }, {
      started: async (task) => {
        task.setStage('checkMicrophone');
      },
      "checkMicrophone": async (task) => {
        const perm = await permissions.getPermissions();
        if (perm.isMicrophoneAllowed) {
          task.setStage('checkStorage');
          return;
        }
        const cd = localData.setMicPermissions.data;
        cd.customDom = permissions.microphoneCustomDom(task, 'checkStorage');
        log(cd);
      },
      "checkStorage": async (task) => {
        const perm = await permissions.getPermissions();
        if (perm.isStorageWriteable && perm.isStorageWriteable) {
          task.setStage('exit');
          return;
        }
        const cd = localData.setStoragePermissions.data;
        cd.customDom = permissions.storageCustomDom(task, 'exit');
        log(cd);
      },
      "exit": async() => {
        log(localData.thankyou.data);
        setTimeout(() => users.gotoHome(), 3000);
      }
    }
  );


  async #startTask() {
    taskManager.startExclusive(this.#permissionTask);
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await speechDispatcher.attachTask(this.#permissionTask);
    await this.#startTask();
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#permissionTask);
    taskManager.end(this.#permissionTask);
  }
}

customElements.define("speakease-permission", Permission);
