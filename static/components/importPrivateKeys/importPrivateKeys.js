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
import { log } from "/intentions/console/console.js";
import blockchain from '../blockchain/blockchain.js';
import clipboard from '/components/clipboard/clipboard.js';
import { updatePrivateKey } from '/components/wallets/wallets.js';
import loader from '/components/loader/loader.js';

const commonFormatter = {
 en: (lText, [value1, value2]) => lText.replace('$1', value1).replace('$2', value2),
 ru: (lText, [value1, value2]) => lText.replace('$1', value1).replace('$2', value2),
 ko: (lText, [value1, value2]) => lText.replace('$1', value1).replace('$2', value2),
};

function keyFormatter( source, { text, key, }) {
  return source.replace('{{entity}}', text)
               .replace('{{key}}', key);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function formatCurrencies(currencies) {
  const cByBc = currencies.reduce((a, {currency, blockchainName, balance }) => {
    if (blockchainName in a) 
      a[blockchainName].push({currency, balance});
    else 
      a[blockchainName] = [{currency, balance}];
    return a;
  }, {});
  for (const bc in cByBc) {
    cByBc[bc] = cByBc[bc].reduce((a,b) => `${a}  ${b.balance} ${b.currency.currency}<br>`, '');
  }
  return `${Object.entries(cByBc).reduce((a, [bc, value]) => `${a}<br>
    <b>${bc}:</b>
    ${value}
    `, '')}`;
}

const localData = {
  noAuth: new LocalString({
    en: 'You are not authorized to view this page',
    ru: 'Вы не авторизованы для этой страницы',
    ko: '이 페이지에 대한 접근권한이 없습니다'
  }),
  importRequest: new LocalString({
    en: `
      <span>Would you like to import own private key?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Import private keys" stage="importRequest?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Import private keys" stage="importRequest?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Вы хотите импортировать приватный ключ?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Import private keys" stage="importRequest?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Import private keys" stage="importRequest?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>Would you like to import own private key?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Import private keys" stage="importRequest?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Import private keys" stage="importRequest?" postfix="No">아니요</button>
      </div>
    `,
  }),
  copyRequest: new LocalString({
    en: `Please copy your private key into clipboard. Blockchain will be detect automatically`,
    ru: `Скопируйте ваш приватный ключ в буфер обмена. Блокчейн будет определен автоматически`,
    ko: `Please copy your private key into clipboard. Blockchain will be detect automatically`,
  }),
  detectedKey: new LocalString({
    en: `
      <span>{{entity}} is detected</span>
      <span class="wrap">{{key}}</span>
    `,
    ru: `
      <span>найден {{entity}}</span>
      <span class="wrap">{{key}}</span>
    `,
    ko: `
      <span>{{entity}} is detected</span>
      <span class="wrap">{{key}}</span>
    `,
    format: keyFormatter,
  }),
  currentKey: new LocalString({
    en: `
      <span>Your current <b>$1 private key</b></span>
      <span class="wrap">$2</span>
      <span>It will be overwriten by new key. Make sure you keep it in a safe place</span>
      `,
    ru: `
      <span>Ваш текущий <b>$1 приватный ключ</b></span>
      <span class="wrap">$2</span>
      <span>Он будет перезаписан новым ключем. Убедитесь, что ключ сохранен в безопасном месте</span>
      `,
    ko: `
      <span>Your current <b>$1 private key</b></span>
      <span class="wrap">$2</span>
      <span>It will be overwriten by new key. Make sure you keep it in a safe place</span>
      `,
    format: commonFormatter,
  }),
  balanceByCurrency: new LocalString({
    en: `Current balances by currency is: $1`,
    ru: `Current balances by currency is: $1`,
    ko: `Current balances by currency is: $1`,
    format: {
      en: (lValue, currencies) => lValue.replace('$1', `${formatCurrencies(currencies)}`),
      ru: (lValue, currencies) => lValue.replace('$1', `${formatCurrencies(currencies)}`),
      ko: (lValue, currencies) => lValue.replace('$1', `${formatCurrencies(currencies)}`),
    }
  }),
  balance: new LocalString({
    en: `Current balance of $1 currency is $2`,
    ru: `Current balance of $1 currency is $2`,
    ko: `Current balance of $1 currency is $2`,
    format: commonFormatter
  }),
  replaceSuggestion: new LocalString({
    en: `
      <span>Would you like to replace you $1 private key?<span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Import private keys" stage="importKeys?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Import private keys" stage="importKeys?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Вы хотите заменить $1 приватный ключ?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Import private keys" stage="importKeys?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Import private keys" stage="importKeys?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>Would you like to replace you $1 private key?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Import private keys" stage="importKeys?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Import private keys" stage="importKeys?" postfix="No">아니요</button>
      </div>
    `,
    format: commonFormatter,
  }),
  alreadyUsed: new LocalString({
    en: 'This key is already installed',
    ru: 'Этот ключ уже установлен',
    ko: 'This key is already installed',
  }),
  replaceCompleted: new LocalString({
    en: 'Your private key had been replaced.',
    ru: 'Your private key had been replaced.',
    ko: 'Your private key had been replaced.',
  }),
  title: new LocalString({
    en: `Import private keys`,
    ru: `Import private keys`,
    ko: `지갑 정보`,
  }),
  finishImport: new LocalString({
    en: 'Bye, see you next time',
    ru: 'Bye, see you next time',
    ko: 'Bye, see you next time',
  }),
}

class ImportPrivateKeys extends HTMLElement {
  #newKey;

  async #getCurrencyData(task, entities) {
    const txts = clipboard.formatDetectedObject(entities);
    const fKey = Object.keys(txts)[0];
    const fText = txts[fKey];
    const newKey = entities[fKey];
    const family = fText.blockchain;
    const keys = blockchain.getUserWalletKeys();
    const oldKey = keys[family]?.private;
    if (oldKey != null) {
      const text = localData.detectedKey.format({ text: fText.text.getText(), key: newKey });
      await log(text.data);
            
      if (newKey === oldKey) {
        task.setStage('ownKeyDetected');
        return;
      }
  
      const cText = localData.currentKey.format([capitalizeFirstLetter(family), oldKey]);
      log(cText.data); 

      const familyCurrencies = blockchain.getCurrenciesByFamily(family);
      const balances = await Promise.allSettled(
      familyCurrencies.map( c => {
        const bcs = Object.values(c.blockchains).filter( bc => bc.family === family);
        return Promise.allSettled(bcs.map(bc => blockchain.getBalance(bc, keys[family]?.public)
        .then( balance => ({currency: c, blockchainName: bc.name, balance}))
        ))
      })
      ).then( result => result.filter( p => p.status == 'fulfilled').map( v => v.value).flat())
      .then(result => result.map( p => p.value));
      const bText = localData.balanceByCurrency.format(balances);
      log(bText.data);
    }
    
    
    const rText = localData.replaceSuggestion.format([family]);
    log(rText.data);
    this.#newKey = {
      family,
      newKey
    }
  }

  #nameTask = new Task({
      name: 'Import private keys',
      text: {
        en: `Import Private keys`,
        ru: `Импорт приватных ключей`,
      }
    }, {
      started: async (task) => {
        const text = localData.importRequest.data;
        log(text);
        task.setStage('importRequest?', null, false);
      },
      'importRequest?-Yes': async (task) => {
        task.setStage('importRequest-start');
      },
      'importRequest?-No': () => {
        users.gotoHome();
      },
      'importRequest-start': async (task) => {
        await clipboard.detect({ task, 
          allow: {
            bitcoinPrivate: true,
            solanaPrivate: true,
            ethereumPrivate: true,
            stellarPrivate: true,
            tronPrivate: true
          }
        });
      },
      'importRequest-start-Clipboard-detected': async (task, entities) => {
        task.setStage('importKeys?', entities);
      },
      'importRequest-start-Clipboard-not-detected': async (_, data) => {
        log(data);
      },
      'ownKeyDetected': async (task) => {
        clipboard.write('');
        await log(localData.alreadyUsed.data);
        task.setStage('importRequest-start');
      },
      'importKeys?': async (task, entities) => {
        await this.#getCurrencyData(task, entities);
      },
      'importKeys?-Yes': async (task) => {
        const text = localData.replaceCompleted.data;
        updatePrivateKey(this.#newKey.family, this.#newKey.newKey);
        await log(text);
        task.setStage('exit');
      },
      'importKeys?-No': async (task) => {
        clipboard.write('');
        task.setStage('importRequest-start');
      }, 
      'exit': async () => {
        await loader.sleep(2000);
        users.gotoHome();
      }
    }
  );

  async #startTask() {
    taskManager.startExclusive(this.#nameTask);
  }
  
  async connectedCallback() {
    try {
      blockchain.getUserWalletKeys();
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

  const activityName = 'importPrivateKeys';

  function createActivity() {
    const activity = new Activity({
      name: activityName,
      text: new LocalString({
        en: `Import private keys`,
        ru: `Импортировать мои приватные ключи`,
        format: (text, name) => `${name}, ${text}`
      }),
      link: '/importKeys.html',
      top: ['settings'],
      order: 15,
      type: 'info',
      description: new LocalString({
        en:'Import your blockchain private keys',
        ru:'Импорт приватныx ключей',
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

  customElements.define("speakease-importkeys", ImportPrivateKeys);
