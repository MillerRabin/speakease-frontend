import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import wallets from "/components/wallets/wallets.js";
import { log } from "/intentions/console/console.js";
import activityManager from "/intentions/activityManager/activityManager.js";
import Activity from "/intentions/activityManager/Activity.js";
import koNLP from "../koNLP/koNLP.js";
import users from "/components/users/users.js";
import voiceRecorder from '/components/voiceRecorder/voiceRecorder.js';
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import { createButtons } from "/components/factories/createButtons.js";

const localData = {
  audioSampleText: new LocalString({
    en: `To record your voice sample, speak a phrase or something into the microphone.`,
    ru: `Начните говорить, Я попробую опознать вас по голосу`,
    ko: `음성 샘플을 녹음하시려면 마이크에 어떤 단어나 문장을 말씀하십시오.`,
    format: (lText, value) => `Say ${value}, ${lText}`
  }),
  changePinWish: new LocalString({
    en: `<span>Do you want to change password?</span>
      ${createButtons('Change password', 'changePin?', {yes: 'Yes', no: 'No'})}`,
    ru: `<span>Вы хотите изменить пароль?</span>
      ${createButtons('Change password', 'changePin?', {yes: 'Да', no: 'Нет'})}`,
    ko: `<span>비밀번호를 바꾸시겠습니까?</span>
      ${createButtons('Change password', 'changePin?', {yes: '예', no: '아니요'})}`
  }),
  changePinProposal: new LocalString({
    en: `Please, say a few words and remember them`,
    ru: `Пожалуйста, произнесите несколько слов и запомните их`,
    ko: `새 비밀번호를 말씀해 주세요`
  }),
  changePinRequirements: new LocalString({
    en: `Password Requirements
    <br>Length: Minimum 4 characters, but we strongly recommend using 12 or more characters.
    <br>Special Characters: Include symbols like $%# to strengthen your password.
    <br>Use your device's keyboard to easily access and enter special characters.
  `,
  ru: `Требования к паролю
    <br>Длина: Пароль должен состоять как минимум из 4 символов. Рекомендуем использовать пароль длинною 12 или больше символов.
    <br>Сложность: Если хотите вводить пароль голосом, то избегайте спецсимволов. Но если вы набираете пароль на клавиатуре, то использование спецсимволов таких как ($ % #) улучшит безопасность пароля.
  `,
  ko: `비밀번호 요구사항
    <br>길이: 비밀번호는 최소 4자리 이상, 하지만 12자리 이상 사용하는 것을 권장합니다.
    <br>특수 문자: ($ % #)와 같은 특수문자 사용이 가능합니다. 하지만 음성 암호를 사용하시려면 특수 문자를 피하십시오.
    <br>특수 문자 사용시 키보드 사용을 권장합니다.
  `,
  }),
  confirmPinCode1: new LocalString({
    en: ` Your password is`,
    ru: ` Ваш пароль`,
    ko: ` 새 비밀번호는 `,
    format: {
      en: (lText, value) => `${lText} "${value}"`,
      ru: (lText, value) => `${lText} "${value}"`,
      ko: (lText, value) => `${lText} ${value}입니다`
    }
  }),
  confirmPinCode2: new LocalString({
    en: `<span>Are you confirm?</span>
      ${createButtons('Change password', 'confirmPinCode?', {yes: 'Yes', no: 'No'})}`,
    ru: `<span>Вы подтверждаете пинкод?</span>
      ${createButtons('Change password', 'confirmPinCode?', {yes: 'Да', no: 'Нет'})}`,
    ko: `<span>승인하시겠습니까?</span>
      ${createButtons('Change password', 'confirmPinCode?', {yes: '예', no: '아니요'})}`
  }),
  successPinCode: new LocalString({
    en: `I have remembered your password as`,
    ru: `Я запомнила ваш пароль - `,
    ko: `새 비밀번호`,
    format: {
      en: (lText, value) => `${lText} ${value}`,
      ru: (lText, value) => `${lText} ${value}`,
      ko: (lText, value) => `${lText} ${koNLP.addObjectParticle(value)} 기억하겠습니다`
    }
  }),
  pinCodeError: new LocalString({
    en: `\nPassword is not valid! Try again.`,
    ru: `\nПароль не валиден! попробуйте еще.`,
    ko: `\n비밀번호가 유효하지 않습니다! 다시 시도해 주세요.`,
  }),
  title: new LocalString({
    en: `Changing password`,
    ru: `Changing password`,
    ko: `비밀번호 변경`,
  }),
}

function createStatusDom() {
 const dm = window.document.createElement('span');
 dm.className = 'signin-user-status'
 return dm;
}

class ChangePin extends HTMLElement {
  #pincode;
  #userData;
  #statusDom = createStatusDom();
  #record = voiceRecorder.get();
  #voiceRecord;

  #recordHandler = (e) => {
    this.#voiceRecord = e.detail;
    speechR.start();
    this.#pinTask.setStage('checkVoiceDataProcess', null, false);
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

  async #savePinAndExit(task) {
    const text = localData.successPinCode.format(this.#pincode);
    text.data.sensitive = true;
    log(text.data);
    await wallets.setPinCode(this.#userData.id, this.#pincode);
    taskManager.end(task);
    users.gotoHome();
  }

  async #rollbackAndExit(task) {
    taskManager.end(task);
    users.gotoHome();
  }

  #pinTask = new Task({
      name: 'Change password',
      text: {
        en: 'Change password',
        ru: 'Изменение пароля',
        ko: '비밀번호 변경'
      }
    }, {
      started: async (task) => {
        task.setStage('changePin?');
      },
      'checkByVoice': async (task) => {
        const td = localData.audioSampleText.data;
        td.customDom = this.#statusDom;
       log(td);
        await speechR.stop();
        task.setStage('checkVoiceData');
      },
      'checkVoiceData': async () => {
        this.#record.start();
      },
      'checkVoiceDataProcess': async (task) => {
        const user = await users.login({
          voiceData: this.#voiceRecord,
        });
        if (!user) {
          task.setStage('checkVoiceData');
          return;
        }
        task.setStage('newPin?');
      },
      'changePin?': () => {
        log(localData.changePinWish.data);
      },
      'changePin?-Yes': (task) => {
        task.setStage('checkByVoice');
      },
      'changePin?-No': (task) => {
        this.#rollbackAndExit(task);
      },
      'newPin?': async () => {
        log(localData.changePinProposal.data);
        log(localData.changePinRequirements.data);
      },
      'setPinCodeError?': async (task) => {
        log(localData.pinCodeError.data);
        task.setStage('changePin?');
      },
      'newPin?-Text': (task, data) => {
        const text = data.text;
        history.disableHistory();
        const pinCode = wallets.getPinFromText(text);
        this.#pincode = pinCode;
        if (pinCode != null) {
          this.#pincode = pinCode;
          task.setStage('confirmPinCode?');
        } else {
          history.enableHistory();
          task.setStage('setPinCodeError?');
        }
      },
      'confirmPinCode?': () => {
        const confirm = localData.confirmPinCode1.format(this.#pincode);
        confirm.data.sensitive = true;
        history.enableHistory();
        log(confirm.data);
        log(localData.confirmPinCode2.data);
      },
      'confirmPinCode?-Yes': (task) => {
        this.#savePinAndExit(task);
      },
      'confirmPinCode?-No': (task) => {
        task.setStage('newPin?');
      }
    }
  );

  async #getName() {
    try {
      const res = await wallets.get();
      return Object.values(res)[0];
    } catch (e) {
      return null;
    }
  }

  async #startTask() {
    await speechDispatcher.attachTask(this.#pinTask);
    taskManager.startExclusive(this.#pinTask);
    this.#userData = await this.#getName();
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await this.#startTask();
    this.#record.addEventListener('speakend', this.#recordHandler);
    users.on.userChanges(this.#updateUserStatusHandler);
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#pinTask);
    taskManager.end(this.#pinTask);
    users.off.userChanges(this.#updateUserStatusHandler);
    this.#record.removeEventListener('speakend', this.#recordHandler);
    speechR.start();
  }
}

const activityName = 'Change password';

function createActivity() {
  const activity = new Activity({
    name: activityName,
    text: new LocalString({
      en: `Change password`,
      ru: `Измени пароль`,
      ko: `비밀번호 변경`,
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/changePin.html',
    order: 13,
    exclude: ['changePin'],
    notVisibleAt: ['settings'],
    type: 'general',
    description: new LocalString({
      en:'If you need to change your password, say - change password',
      ru:'Если вы хотите изменить пароль, произнесите - измени пароль',
      ko:'비밀번호 변경을 원하시면 다음과 같이 말씀해 주세요 - 비밀번호 변경'
    })
  }, {
    check: function () {
      const signIn = users.getUser();
      const hw = wallets.has();
      if (!hw || !signIn) return false;
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

customElements.define("speakease-changepin", ChangePin);
