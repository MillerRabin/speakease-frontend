import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import system from "/components/system/system.js";
import { LocalString } from '../local/local.js';
import history from "/components/history/history.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import users from "/components/users/users.js";
import { write } from "/components/clipboard/clipboard.js";
import { log } from "/intentions/console/console.js";
import blockchain, { blockchainsByFamily, getCurrencies } from '../blockchain/blockchain.js';
import { getEntityByName } from '/intentions/main.js';

const localData = {
  noAuth: new LocalString({
    en: 'You are not authorized to view this page',
    ru: 'Вы не авторизованы для этой страницы',
    ko: '이 페이지에 대한 접근권한이 없습니다'
  }),
  privateKeysWarning: new LocalString({
    en: `<h2>Your private keys</h2><p><b>Warning:</b> Do not under any circumstances share your private keys with anyone. Sharing your private key grants unauthorized access to your wallet and its contents.</p>`,
    ru: `<h2>Ваши приватные ключи</h2><p><b>Внимание:</b> Ни при каких обстоятельствах не разглашайте кому-либо ваши приватные ключи. Предоставление ваших ключей 3 лицам ведет к несанкционированному доступу в ваш кошелек</p>`,
    ko: `<h2>개인키 정보</h2><p><b>경고:</b> 어떠한 경우에도 개인키를 누구와도 공유하지 마십시오. 개인키를 공유하면 지갑과 그 내용에 대한 무단 액세스 권한이 부여됩니다.</p>`,
  }),  
  all: new LocalString({
    en: `Copy all keys`,
    ru: `Copy all keys`,
    ko: `모든 키 복사`,
  }),
  copyAllKey: new LocalString({
    en: `Copy all keys`,
    ru: `Copy all keys`,
    ko: `모든`,
  }),
  copy: new LocalString({
    en: `copy`,
    ru: `copy`,
    ko: `복사`,
  }),
  privateKeyCopied: new LocalString({
    en: `Your $1 private key copied to clipboard.`,
    ru: `Your $1 private key copied to clipboard.`,
    ko: `$1 개인키가 복사되었습니다.`,
    forceScroll: true,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', value),
    }
  }),
  title: new LocalString({
    en: `Wallet data`,
    ru: `Wallet data`,
    ko: `지갑 정보`,
  }),
}

function createStatusDom() {
 const dm = window.document.createElement('span');
 dm.className = 'export-keys'
 return dm;
}

const currencyByFamily = getCurrencies()
   .reduce((a, c) => {      
      const endps = Object.values(c.blockchains);
      for (const en of endps) {
        const family = en.family;
        if (a[family] == null) a[family] = [];
        a[family].push(c.currency);
      }
      return a;
  }, {});

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function getTemplate(keys) {
  let result = '';
  const netByFamily = blockchainsByFamily();
  const copyAllBtn = localData.all.getText();
  for (const bc in keys) {
    const btnName = `${capitalize(bc)} ${localData.copy.getText()}`;
      result += `<div class="pk_family">
                    <h3 class="bc_net">${netByFamily[bc].join(', ')}</h3>
                    <div class="pk_bcfamily">
                      <h3>${currencyByFamily[bc].join(', ')}</h3>
                    </div>
                    <div>
                      <h4>Address</h4>
                      <p>${keys[bc].publicText}</p>
                      <h4>Private key</h4>
                      <p>${keys[bc].privateText}</p>
                    </div>
                    <button class="pk_icon"
                      data-private="${keys[bc].privateText}"
                      data-public="${keys[bc].publicText}"
                      data-currency="${bc}">${btnName}</button>
                    </div>`;
    }
    return result + `<button class="copy_all_keys">${copyAllBtn}</button>`;
}

class ExportPrivateKeys extends HTMLElement {
    #keys;
    #customDom = createStatusDom();
    #nameTask = new Task({
        name: 'Your wallet data',
        text: {
          en: `Your Private keys`,
          ru: `Ваши приватные ключи`,
          ko: `개인키 정보`,
        }
      }, {
        started: async (task) => {
          task.setStage('exportKeys?', null, false);
          const text = localData.privateKeysWarning.data;
          text.customDom = this.#customDom;
          text.customDom.innerHTML = getTemplate(this.#keys);
          const copyAllElt = text.customDom.querySelector('.copy_all_keys');
          if (copyAllElt) {
            copyAllElt.onclick = () => {
                let txt = '';
                for (const bc in this.#keys) {
                    txt += `${capitalize(bc)}\n\npublic:\n${this.#keys[bc]?.publicText}\nprivate:\n${this.#keys[bc]?.privateText}\n\n`;
                }
                write(txt.trim());
                this.#updateStatusMsg('all');

            }
          }
          [...text.customDom.querySelectorAll('.pk_icon')].forEach( el => {
            el.onclick = () => {
                const ds = el.dataset;
                write(ds.private);
                this.#updateStatusMsg(ds.currency);
            }
          });
          text.sensitive = true;
          log(text);
        },
        'exportKeys?-Copy': (task, entities) => {
          const currency = getEntityByName(entities, 'Currency');
          const all = getEntityByName(entities, 'AllRequest');
          if(currency) {
            const bc = getEntityByName(entities, 'Blockchain');
            const family = bc?.value?.family ?? currency?.value?.family;
            if (family) this.copyKey(family);
          }
          if(all) {
            const copyAllElt = window.document.querySelector('.copy_all_keys');
            copyAllElt.click();
          }
        }
      }
    );

    async #updateStatusMsg(currency) {
      const text = localData.privateKeyCopied.format(currency);
      await log(text.data);
    }

    async #startTask() {
      taskManager.startExclusive(this.#nameTask);
    }
    
    copyKey(family) {
      const {privateText: privateKey} = this.#keys[family];
      write(privateKey);
      this.#updateStatusMsg(family);
      history.setState('history');
    }

    async connectedCallback() {
      try {
        this.#keys = blockchain.getUserWalletKeys();
      } catch (e) {
        console.error(e);
        log(localData.noAuth.data);
        return users.gotoHome();
      }
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

  const activityName = 'exportWalletData';

  function createActivity() {
    const activity = new Activity({
      name: activityName,
      text: new LocalString({
        en: `Show private keys`,
        ru: `Покажи мои публичные ключи`,
        ko: `개인키 보기`,
        // ko: `내 지갑 세부 정보 보기`, need to be changed because of - 'show my wallet details' changed to 'show my private keys' ToDo
        format: (text, name) => `${name}, ${text}`
      }),
      link: '/exportKeys.html',
      top: ['settings'],
      order: 15,
      type: 'info',
      description: new LocalString({
        en:'Wallet details contains your blockchain private and public keys',
        ru:'Данные кошелька содержат приватные и открытые ключи',
        ko:'지갑 세부 정보에는 개인키와 공개키가 포함되어 있습니다'
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

  createActivity()

  customElements.define("speakease-exportkeys", ExportPrivateKeys);
