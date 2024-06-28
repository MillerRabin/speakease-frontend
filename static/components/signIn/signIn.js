import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import router from "/components/router/router.js";
import wallets from "/components/wallets/wallets.js";
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import voiceRecorder from '/components/voiceRecorder/voiceRecorder.js';
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import users from "/components/users/users.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import { log } from "/intentions/console/console.js";
import config from "/config.js";
import fs from '/components/fs/fs.js'

const localData = {
  askForPinCode: new LocalString({
    en: `Voice authentication failed. Please enter your password by speaking or typing it`,
    ru: `Не могу опознать вас. Скажите ваш пароль`,
    ko: `당신을 식별할 수 없습니다. 비밀번호를 말씀하여 주시거나 입력해 주세요`,
  }),
  wrongPinCode: new LocalString({
    en: `<p>$1 - wrong password! Try again!</p><p>$2 tries left</p>`,
    ru: `<p>$1 - некорректный пароль! Попробуйте еще раз!</p><p>Осталось $2</p>`,
    ko: `<p>$1 - 잘못된 비밀번호입니다! 다시 시도해 주세요!</p><p>재시도 가능 횟수 $2번 남았습니다</p>`,
    format: {
      en: (lText, entity) => {
        return lText
          .replace('$1', entity.password)
          .replace('$2', entity.tries)
      },
      ru: (lText, entity) => {
        return lText
          .replace('$1', entity.password)
          .replace('$2', numWord(entity.tries, ['попытка', 'попытки', 'попыток']))
      },
      ko: (lText, entity) => {
        return lText
          .replace('$1', entity.password)
          .replace('$2', entity.tries)
      },
    }
  }),
  wrongPinCodeVoice: new LocalString({
    en: `Wrong password!`,
    ru: `Некорректный пароль`,
    ko: `잘못된 비밀번호입니다! 다시 시도해 주세요!`
  }),
  noWallet: new LocalString({
    en: `You have no wallet created. Signing in is impossible`,
    ru: `У вас нет созданного кошелька. Вход невозможен`,
    ko: `지갑이 생성되어 있지 않습니다. 로그인이 불가능합니다`
  }),
  audioSampleText: new LocalString({
    en: `To record your voice sample, speak a phrase or something into the microphone.`,
    ru: `Начните говорить, Я попробую опознать вас по голосу`,
    ko: `음성 샘플을 녹음하시려면 마이크에 어떤 단어나 문장을 말하십시오.`,
    format: (lText, value) => `Say ${value}, ${lText}`
  }),
  confirmLogin: new LocalString({
    en: `Welcome $1. Your wallet is at your service.`,
    ru: `Добро пожаловать $1. Ваш кошелек к вашим услугам.`,
    ko: `$1님 환영합니다. 최선의 서비스를 제공하겠습니다`,
    format: (lText, value) => lText.replace('$1', value)
  }),
  prohibitedPasswordVerificationTimeLimit: new LocalString({
    en: `Password verification is prohibited.  Wait $1 minutes`,
    ru: `Верификация по паролю недоступна. Подожите $1 `,
    ko: `비밀번호 오류 횟수가 초과되었습니다. $1분 기다려 주세요`,
    format: {
      en: (lText, value) => lText.replaceAll('$1', value),
      ru: (lText, value) => lText.replaceAll('$1', numWord(value, ['минута', 'минуты', 'минут'])),
      ko: (lText, value) => lText.replaceAll('$1', value)
    }
  }),
  title: new LocalString({
    en: `Sign in`,
    ru: `Sign in`,
    ko: `로그인`
  }),
}

function numWord(value, words){  
	value = Math.abs(value) % 100; 
	const num = value % 10;
	if(value > 10 && value < 20) return `${value} ${words[2]}`; 
	if(num > 1 && num < 5) return `${value} ${words[1]}`;
	if(num == 1) return `${value} ${words[0]}`; 
	return `${value} ${words[2]}`;
}

function createStatusDom() {
 const dm = window.document.createElement('span');
 dm.className = 'signin-user-status'
 return dm;
}

class SignIn extends HTMLElement {
  #wallet;
  #record = voiceRecorder.get();
  #voiceRecord;
  #signinTask;
  #try = 0;
  #tryCode = 0;
  #statusDom = createStatusDom();

  async #rollbackAndExit() {
    log(localData.noWallet.data);
    setTimeout(() => router.goto('/', null, false), 3000);
  }

  #updateUserStatus(text) {
    const tDots = text.substr(text.length - 3);
    if (tDots == '...')
      this.#statusDom.classList.add('animated');
    else
      this.#statusDom.classList.remove('animated');
    this.#statusDom.innerHTML = text;
  }
  #checkLimitAccess(timeLimit) {
    if(!timeLimit) return true;
    if(timeLimit && new Date().getTime() < timeLimit) {
      return false;
    } else {
      fs.remove('passwordTimeLimit');
      return true;
    }
  }
  #getEstimatedTime(timeLimit) {
    const minutes = Math.floor(((timeLimit - new Date().getTime()) / (1000 * 60)) % 60);
    return localData.prohibitedPasswordVerificationTimeLimit.format(minutes);
  }

  #updateUserStatusHandler = (event) => {
    this.#updateUserStatus(event.data.status.getText());
  }

  #deleteHistory() {
    window.history.deleteAll();
  }

  async #verifyPinCode(text) {
    const check = await wallets.verifyPinCode(this.#wallet, text);
    if (check) {
      const text = localData.confirmLogin.format(this.#wallet.name);
      log(text.data);
      users.setUser({ id: this.#wallet.id, userName: this.#wallet.name });
      this.#signinTask.setStage('success');
      return true;
    }
    return false;
  }

  #signInTask = new Task({
      name: 'Sign in',
      text: {
        en: 'Sign in',
        ru: 'Войти',
        ko: '로그인'
      }
    }, {
      started: async (task) => {
        this.#signinTask = task;
        this.#wallet = await this.#getWallet();
        if (this.#wallet?.name != null) {
          task.setStage('setAuth');
          return;
        }
        this.#rollbackAndExit(task);
      },
      'setAuth': async (task) => {
        const td = localData.audioSampleText.data;
        td.customDom = this.#statusDom;
        log(td);
        await speechR.stop();
        task.setStage('setAuthStart');
      },
      'setAuthStart': async () => {
        this.#record.start();
      },
      'setAuthStart-Text': async (_, data) => {
        const text = data.text;
        if (await this.#verifyPinCode(text)) return;
        if (data.source == 'keyboard')
          log(localData.wrongPinCodeVoice.data);
      },
      'setAuthProcess': async (task) => {
        const user = await users.login({
          voiceData: this.#voiceRecord,
        });
        if (!user) {
          this.#try++;
          if (this.#try == config.maxTryVoiceSignIn) {
            task.setStage('verifyPinCode?');
            return;
          }
          task.setStage('setAuthStart');
          return;
        }
        const text = localData.confirmLogin.format(user.userName);
        log(text.data);
        task.setStage('success');
      },
      'setAuthProcess-Text': async (_, data) => {
        const text = data.text;
        if (await this.#verifyPinCode(text)) return;
        if (data.source == 'keyboard')
          log(localData.wrongPinCodeVoice.data);
      },
      'verifyPinCode?': (task) => {
        const timeLimit = fs.load('passwordTimeLimit');
        const limitAccess  = this.#checkLimitAccess(timeLimit);
        if(!limitAccess) {
          const textConsole = this.#getEstimatedTime(timeLimit, true);
          log(textConsole.data);
          setTimeout(() => {
            task.setStage('Cancel');
          }, 3000)
        } else if (limitAccess && this.#tryCode < config.maxTryPasswordSignIn) {
          if(this.#tryCode == 0) log(localData.askForPinCode.data);
        } else {
          const currentDate = new Date().getTime();
          const limitTimePasswordVerify  = currentDate + config.maxTryTimeLimit;
          fs.save('passwordTimeLimit', limitTimePasswordVerify);
          const minutes = Math.floor((config.maxTryTimeLimit / (1000 * 60)));
          const textConsole = localData.prohibitedPasswordVerificationTimeLimit.format(minutes);
          log(textConsole.data);
          setTimeout(() => {
            task.setStage('Cancel');
          }, 3000)
        }
      },
      'verifyPinCode?-Text': async (task, data) => {
          const text = data.text;
          if (await this.#verifyPinCode(text)) return;
          const textConsole = localData.wrongPinCode.format({ password: text, tries: (config.maxTryPasswordSignIn - 1) - this.#tryCode });
          log(textConsole.data);
          this.#tryCode++;
          task.setStage('verifyPinCode?');
      },
      'success': () => {
        setTimeout(() => router.goto(`/home.html`, null, false), 3000);
      },
      'exit': () => {

      },
      'Cancel': (task) => {
        task.failed = true;
        setTimeout(() => router.goto('/', null, false), 0);
      }
    }
  );

  async #getWallet() {
    try {
      const wl = await wallets.get();
      return Object.values(wl)[0];
    } catch (e) {
      return null;
    }
  }

  #recordHandler = (e) => {
    this.#voiceRecord = e.detail;
    speechR.start();
    this.#signinTask.setStage('setAuthProcess', null, false);
  }

  async #startTask() {
    taskManager.startExclusive(this.#signInTask);
  }

  async connectedCallback() {
    history.setUIEnabled(false, 'history');
    this.components = {};
    breadcrumbs.setTitle(localData.title.getText());
    await speechDispatcher.attachTask(this.#signInTask)
    this.#record.addEventListener('speakend', this.#recordHandler);
    users.on.userChanges(this.#updateUserStatusHandler);
    await this.#startTask();
  }

  async disconnectedCallback() {
    this.#record.removeEventListener('speakend', this.#recordHandler);
    users.off.userChanges(this.#updateUserStatusHandler);
    speechDispatcher.detachTask(this.#signInTask);
    taskManager.end(this.#signInTask);
    speechR.start();
  }
}

customElements.define("speakease-signin", SignIn);
