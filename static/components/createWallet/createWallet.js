import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import router from "/components/router/router.js";
import wallets from "/components/wallets/wallets.js";
import history from "/components/history/history.js";
import system from "/components/system/system.js";
import { LocalString } from "/components/local/local.js";
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import { log } from "/intentions/console/console.js";
import users from "/components/users/users.js";
import voiceDataRequestTask from "/components/voiceDataRequestTask/voiceDataRequestTask.js";
import koNLP from "/components/koNLP/koNLP.js";
import { generateRandomKeys } from "/components/blockchain/blockchain.js";

const localData = {
  setName: new LocalString({
    en: `How would you like to name your wallet?`,
    ru: `Как бы вы хотели назвать ваш кошелек?`,
    ko: `전자 지갑을 무엇으로 부르시겠습니까?`,
  }),
  nameExistsAlready: new LocalString({
    en: `Name $1 is given to another wallet. Give me another name, please`,
    ru: `Имя $1 уже дано другому кошельку. Дайте мне другое имя, пожалуйста`,
    ko: `$1 존재하는 이름입니다. 다른 이름을 말씀해 주세요`,
    format: {
      en: (lText, value) => lText.replaceAll('$1', value),
      ru: (lText, value) => lText.replaceAll('$1', value),
      ko: (lText, value) => lText.replaceAll('$1', koNLP.addTopicMarker(value))
    }
  }),
  confirm: new LocalString({
    en: `
      <span>Are you confirming that the name of your wallet is <b>$1</b>?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Create wallet" stage="saveName?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Create wallet" stage="saveName?" postfix="No">no</button>
      </div>
    `,
    ru: `
      <span>Вы подтверждаете, что имя вашего кошелька <b>$1?</b></span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Create wallet" stage="saveName?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Create wallet" stage="saveName?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      전자 지갑명을 <b>$1</b> 하시겠습니까?
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Create wallet" stage="saveName?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Create wallet" stage="saveName?" postfix="No">아니요</button>
      </div>
    `,
    format: {
      en: (lText, value) => lText.replaceAll('$1', value),
      ru: (lText, value) => lText.replaceAll('$1', value),
      ko: (lText, value) => lText.replaceAll('$1', koNLP.addDirectionParticle(value)),
    }
  }),
  successName: new LocalString({
    en: `The name of your wallet has been set as`,
    ru: `Установленное имя вашего кошелька `,
    ko: `전자 지갑명을 `,
    format: {
      en: (lText, value) => `<p>${lText} <b>${value}</b></p>`,
      ru: (lText, value) => `<p>${lText} <b>${value}</b></p>`,
      ko: (lText, value) => `<p>${lText} <b>${koNLP.addDirectionParticle(value)}</b> 설정하였습니다</p>`,
    }
  }),
  pinCode: new LocalString({
    en: `You need to create password.`,
    ru: `Вам нужно создать пароль.`,
    ko: `비밀번호를 생성해야합니다.`,
  }),
  changePinRequirements: new LocalString({
    en: `
      <p><b>Password Requirements</b></p>
      <p>Length: Minimum 4 characters, but we strongly recommend using 12 or more characters.</p>
      <p>Special Characters: Include symbols like $%# to strengthen your password.</p>
      <p>Use your device's keyboard to easily access and enter special characters.</p>
    `,
    ru: `
      <p><b>Требования к паролю</b></p>
      <p>Длина: Пароль должен состоять как минимум из 4 символов. Рекомендуем использовать пароль длинною 12 или больше символов.</p>
      <p>Сложность: Если хотите вводить пароль голосом, то избегайте спецсимволов. Но если вы набираете пароль на клавиатуре, 
         то использование спецсимволов таких как ($ % #) улучшит безопасность пароля.</p>
    `,
    ko: `
      <p><b>비밀번호 요구사항</b></p>
      <p>길이: 비밀번호는 최소 4자리 이상, 하지만 12자리 이상 사용하는 것을 권장합니다.</p>
      <p>특수 문자: ($ % #)와 같은 특수문자 사용이 가능합니다. 하지만 음성 암호를 사용하시려면 특수 문자를 피하십시오.</p>
      <p>특수 문자 사용시 키보드 사용을 권장드립니다.</p>
  `,
  }),
  pinCodeError: new LocalString({
    en: `Password is not valid! Try again.`,
    ru: `Пароль не валиден! попробуйте еще.`,
    ko: `비밀번호가 유효하지 않습니다! 다시 시도해 주세요.`,
  }),
  confirmPinCode1: new LocalString({
    en: ` Your password is`,
    ru: ` Ваш пароль`,
    ko: ` 입력하신 비밀번호는`,
    format: {
      en: (lText, value) => `<p>${lText} <b>${value}</b></p>`,
      ru: (lText, value) => `<p>${lText} <b>${value}</b></p>`,
      ko: (lText, value) => `<p>${lText} <b>${value}</b>입니다</p>`,
    }
  }),
  confirmPinCode2: new LocalString({
    en: `
      <span>Are you confirming your password?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Create wallet" stage="confirmPinCode?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Create wallet" stage="confirmPinCode?" postfix="No">no</button>
      </div>  
    `,
    ru: `
      <span>Вы подтверждаете пароль?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Create wallet" stage="confirmPinCode?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Create wallet" stage="confirmPinCode?" postfix="No">Нет</button>
      </div> 
    `,
    ko: `
      <span>비밀번호를 확정하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Create wallet" stage="confirmPinCode?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Create wallet" stage="confirmPinCode?" postfix="No">아니요</button>
      </div> 
    `,
  }),
  successPinCode: new LocalString({
    en: `I have remembered your password as`,
    ru: `Я запомнила ваш пароль - `,
    ko: `비밀번호를 `,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addDirectionParticle(value)} 설정하였습니다`,
    },
  }),
  generatedDefault: new LocalString({
    en: `
      <span>Generated default keys:<span>
      <div>$1<div>
      <span>Please save these private keys in safe place</span>
    `,
    ru: `
      <span>Сгенерированы приватные ключи:</span>
      <div>$1</div>
      <span>Пожалуйста сохрание их в безопасном месте</span>
      `,
    ko: `
      <span>Generated default keys:</span>
      <div>$1</div>
      <span>You can import your own keys after login, just say import private key</span>`,
    format: {
      en: (lText, values) => lText.replace('$1', `${
        Object.entries(values).reduce((a,b) => `${a}<b>${b[0]}:</b> ${wallets.formatPrivateKey(b[1])}<br>`, '')
      }`),
      ru: (lText, values) => lText.replace('$1', `${
        Object.entries(values).reduce((a,b) => `${a}<b>${b[0]}:</b> ${wallets.formatPrivateKey(b[1])}<br>`, '')
      }`),
      ko: (lText, values) => lText.replace('$1', `${
        Object.entries(values).reduce((a,b) => `${a}<b>${b[0]}:</b> ${wallets.formatPrivateKey(b[1])}<br>`, '')
      }`),
    }
  }),
  checkboxConfirmPrivateKeys: new LocalString({
    en: `
    <p>I acknowledge that SpeakEase is unable to retrieve those private keys on my behalf.</p>
    <button is="speakease-taskbutton" class="checkbox" task="Create wallet" stage="checkboxConfirmPrivateKeys" postfix="Approve">Approve</button>
  `,
  ru: `
    <p>Я признаю, что Speakeasy не может получить эти секретные ключи от моего имени</p>
    <button is="speakease-taskbutton" class="checkbox" task="Create wallet" stage="checkboxConfirmPrivateKeys" postfix="Approve">Подтверждаю</button>
  `,
  ko: `
    <p>"저는 SpeakEase에서 개인키를 찾아줄 수 없다는 것을 인지하였습니다"</p>
    <button is="speakease-taskbutton" class="checkbox" task="Create wallet" stage="checkboxConfirmPrivateKeys" postfix="Approve">확인</button>
  `
  }),
  rollback: new LocalString({
    en: `I like your old name`,
    ru: `Мне нравится ваше старое имя`,
    ko: `기존 이름`,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addSubjectParticle(value)} 더 마음에 듭니다`,
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
    en: `Create wallet`,
    ru: `Create wallet`,
    ko: `지갑 생성`
  }),
}

function createStatusDom() {
  const dm = window.document.createElement('span');
  dm.className = 'signin-user-status'
  return dm;
 }

class CreateWallet extends HTMLElement {
  #name;
  #pincode;
  #voiceRecord;
  #keys;
  #statusDom = createStatusDom();
  #generationStatus = createStatusDom();

  #getWallets() {
    try {
      return wallets.get()
    } catch (e) {
      return {};
    }
  }

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

  #updateBlockchainStatus(text) {
    const tDots = text.substr(text.length - 3);
    if (tDots == '...')
      this.#generationStatus.classList.add('animated');
    else
      this.#generationStatus.classList.remove('animated');
    this.#generationStatus.innerHTML = text;
  }

  #updateBlockchainStatusHandler = (event) => {
    this.#updateBlockchainStatus(event.data.status.getText());
  };



  async #saveDataAndExit() {
    await users.save({
      userName: this.#name,
      voiceRecord: this.#voiceRecord,
      pinCode: this.#pincode,
      keys: this.#keys,
    });
    users.gotoHome();
  }

  async #rollbackAndExit() {
    const oldName = await this.#getName();
    const my = localData.rollback.format(oldName);
    log(my.data);
    router.goto(`/home.html`);
  }

  #walletTask = new Task({
    name: 'Create wallet',
    text: {
      en: 'Create wallet',
      ru: 'Создание кошелька',
      ko: '지갑 생성'
    }
  }, {
    started: async (task) => {
      task.setStage('setName?');
      speechR.start();
    },
    'setName?': async () => {
      const data = localData.setName.data;
      log(data);
    },
    'setName?-Text': async (task, data) => {
      const text = data.text;
      const name = await system.getNameFromText(text);
      if (name == null) return;
      if (Object.keys(this.#getWallets()).some( n => n == name)) {
        const data = localData.nameExistsAlready.format(name);
        log(data.data);
        task.setStage('setName?');
        return;
      }
      this.#name = name;
      const confirm = localData.confirm.format(name);
      log(confirm.data);
      task.setStage('saveName?', null, false);
    },
    'saveName?-Yes': (task) => {
      const my = localData.successName.format(this.#name);
      log(my.data);
      task.setStage('setSample');
    },
    'saveName?-No': (task) => {
      task.setStage('setName?', null, false);
    },
    'setSample': async (task) => {
      this.#voiceRecord = await voiceDataRequestTask.request('Create wallet');
      task.setStage('setPinCode?');
    },
    'setPinCode?': async () => {
      log(localData.pinCode.data);
      log(localData.changePinRequirements.data);
    },
    'setPinCode?-Text': (task, data) => {
      const text = data.text;
      history.disableHistory();
      const pinCode = wallets.getPinFromText(text);
      if (pinCode != null) {
        this.#pincode = pinCode;
        task.setStage('confirmPinCode?');
      } else {
        history.enableHistory();
        task.setStage('setPinCodeError?');
      }
    },
    'setPinCodeError?': async (task) => {
      log(localData.pinCodeError.data);
      task.setStage('setPinCode?');
    },
    'confirmPinCode?': async () => {
      const fmt = localData.confirmPinCode1.format(this.#pincode);
      fmt.data.sensitive = true;
      history.enableHistory();
      log(fmt.data);
      log(localData.confirmPinCode2.data);
    },
    'confirmPinCode?-Yes': async (task) => {
      const text = localData.successPinCode.format(this.#pincode);
      text.data.sensitive = true;
      log(text.data);
      task.setStage('generateDefault');
    },
    'confirmPinCode?-No': (task) => {
      task.setStage('setPinCode?');
    },
    'generateDefault': async (task) => {
      this.#keys = await generateRandomKeys();
      const text = localData.generatedDefault.format(this.#keys);
      await log(text.data);
      await log(localData.checkboxConfirmPrivateKeys.data);
      task.setStage('checkboxConfirmPrivateKeys', null, false);
    },
    'checkboxConfirmPrivateKeys-Approve': async (task) => {
      task.setStage('exit');
    },
    'exit': async() => {
      const td = localData.saving.data;
      td.customDom = this.#statusDom;
      await log(td);
      await this.#saveDataAndExit();
    },
    'Cancel': async(task) => {
      task.failed = true;
      await this.#rollbackAndExit();
    }
  });

  async #getName() {
    try {
      return await wallets.get();
    } catch (e) {
      return null;
    }
  }

  #startTask() {
    taskManager.startExclusive(this.#walletTask);
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await speechDispatcher.attachTask(this.#walletTask);
    users.on.userChanges(this.#updateUserStatusHandler);
    wallets.on.walletChanges(this.#updateBlockchainStatusHandler);
    this.#startTask();
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#walletTask);
    users.off.userChanges(this.#updateUserStatusHandler);
    wallets.off.walletChanges(this.#updateBlockchainStatusHandler);
    taskManager.end(this.#walletTask);
    speechR.start();
  }
}

customElements.define("speakease-createwallet", CreateWallet);
