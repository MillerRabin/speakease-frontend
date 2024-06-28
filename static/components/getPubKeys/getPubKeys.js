import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import system from "/components/system/system.js";
import { LocalString } from '../local/local.js';
import history from "/components/history/history.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import { getEntityByName } from '/intentions/main.js';
import users from "/components/users/users.js";
import { log } from "/intentions/console/console.js";
import { getCurrencies } from '/intentions/cryptoTypes/main.js';
import { write } from "/components/clipboard/clipboard.js";
import checkCurrencyDetails from '/components/checkCurrencyDetails/checkCurrencyDetails.js';
import blockchain, { blockchainsByFamily } from '/components/blockchain/blockchain.js';

const localData = {
  noAuth: new LocalString({
    en: 'You are not authorized to view this page',
    ru: 'Вы не авторизованы для этой страницы',
    ko: '이 페이지에 대한 접근권한이 없습니다'
  }),
  copy: new LocalString({
    en: `copy`,
    ru: `copy`,
    ko: `복사`,
  }),
  copiedToClipboard: new LocalString({
    en: `Copied to clipboard`,
    ru: `Copied to clipboard`,
    ko: `클립보드에 복사되었습니다`,
  }),
  publicKeyCopied: new LocalString({
    en: `Your $1 public key copied to clipboard.`,
    ru: `Your $1 public key copied to clipboard.`,
    ko: `$1 공개키가 복사되었습니다.`,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', value),
    }
  }),
  title: new LocalString({
    en: `Public keys`,
    ru: `Public keys`,
    ko: `공개키`,
  }),
}

const currencyMap = new Map(getCurrencies()
  .reduce((a,c) => {
    const { currency, family } = c.value;
    if (family) a.push([currency, family])
    return a;
  }, [])
  );

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createStatusDom() {
 return window.document.createElement('button');
}

class GetPubKeys extends HTMLElement {
    #user = users.getUser();
    #pubKeys;
    #currency = null;
    #blockchain = null;
    #nameTask = new Task({
        name: 'Your public keys',
        text: {
          en: 'Your public keys',
          ru: 'Ваши публичные ключи',
          ko: '공개키 정보'
        }
      }, {
        started: async (task) => {
          this.#pubKeys = Object.values(blockchain.getUserWalletKeys());
          const netByFamily = blockchainsByFamily();
          task.setStage('showKeys?', null, false);
          for (const item of this.#pubKeys) {
            const btnName = `${capitalize(item.key)} ${localData.copy.getText()}`;
            const text = (
              new LocalString({ 
                en: `<b>${netByFamily[item.key].join(', ')}</b>
                    <span class="pubkey_value">${item.publicText}</span>`
              })
            ).data;
            text.customDom = createStatusDom();
            text.customDom.classList.add('el_pubkey');
            text.customDom.classList.add(`${item.key}`);
            text.customDom.setAttribute('currency', item.key[0].toUpperCase() + item.key.slice(1));
            text.customDom.onclick = (ev) => {
              const { public: pubkey} = this.#pubKeys.find( pk => pk.key == item.key);
              write(pubkey);
              this.#updateStatusMsg(item.key, ev.target);
            }
            text.customDom.innerHTML = `${btnName}`;
            log(text);
          }
          if (this.#currency || this.#blockchain) {
            const bc_family = this.#blockchain ?? currencyMap.get(this.#currency);
            const { public: pubkey} = this.#pubKeys.find( pk => pk.key == bc_family);
            write(pubkey);
            this.#updateStatusMsg(bc_family);
          }
        },
        'showKeys?-Copy': (_, entities) => {
          const currency = getEntityByName(entities, 'Currency');
          const bc = getEntityByName(entities, 'Blockchain');
          let family = bc?.value?.family ?? currency?.value?.family;
          if (family) {
            this.copyKey(family);
          }
        }
      }
    );

    async #updateStatusMsg(selector, el = null) {
      const netByFamily = blockchainsByFamily();
      const text = localData.publicKeyCopied.format(netByFamily[selector].join(', ')).getText();
      log(text);
      if (!el) {
        el = document.querySelector(`.el_pubkey.${selector}`);
        if (!el) {
          await new Promise( r => setTimeout(r, 500));
          el = document.querySelector(`.el_pubkey.${selector}`);
          if (!el) return;
        }
      }
      el.innerHTML = localData.copiedToClipboard.getText();
      const allExceptEl = [...document.querySelectorAll('.el_pubkey')].filter( e => el != e);
            
      for (const el of allExceptEl) 
        el.innerHTML = `${el.getAttribute('currency')} ${localData.copy.getText()}`;
      

      setTimeout(() => el.innerHTML = `${el.getAttribute('currency')} ${localData.copy.getText()}`, 10000);
      return;
    }

    async #startTask() {
      taskManager.startExclusive(this.#nameTask);
    }
    
    copyKey(family) {
      const { public: pubkey} = this.#pubKeys.find( pk => pk.key == family);
      write(pubkey);
      this.#updateStatusMsg(family);
      history.setState('history');
    }

    async connectedCallback() {
      history.setUIEnabled(false, 'history');
      if (this.#user == null) {
        log(localData.noAuth.data)
        setTimeout(() => {
          users.gotoHome();
        }, 2000);
        return;
      }
      breadcrumbs.setTitle(localData.title.getText());
      await speechDispatcher.attachTask(this.#nameTask);
      await this.#startTask();
    }

    static get observedAttributes() {
      return ['currency', 'blockchain'];
    }

    async attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'currency') {
        if (oldValue === newValue) return;
        this.#currency = newValue;
      }
      if (name === 'blockchain') {
        if (oldValue === newValue) return;
        this.#blockchain = newValue;
      }
    }

    async disconnectedCallback() {
      speechDispatcher.detachTask(this.#nameTask);
      taskManager.end(this.#nameTask);
    }
  }

  const activityName = 'publicKeys';

  function createActivity() {
    const activity = new Activity({
      name: activityName,
      text: new LocalString({
        en: `Show wallet address`,
        ru: `Покажи мои платежные реквизиты`,
        ko: `지갑 주소 보기`,
        format: (text, name) => `${name}, ${text}`
      }),
      link: '/getPubKeys.html',
      top: ['home'],
      order: 5,
      type: 'info',
      description: new LocalString({
        en:'Payments details contains your blockchain public keys',
        ru:'Платежные реквизиты содержат открытые ключи',
        ko:'결제 내역에는 블록체인 공개키가 포함되어 있습니다'
      })
    }, {
      check: function () {
        if (!system.hasName()) return false;
        const user = users.getUser();
        return (user != null);
      }
    });
    activityManager.start(activity);
    return activity;
  }

  createActivity();
  checkCurrencyDetails.init();

  customElements.define("speakease-getkeys", GetPubKeys);
