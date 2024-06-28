import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local from "/components/local/local.js";
import "./components/receiptHistoryItem.js";
import "./components/receiptHistoryFilter.js";
import "/components/preloader/preloader.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import system from "/components/system/system.js";
import users from "/components/users/users.js";
import { log } from "/intentions/console/console.js";
import localContacts from "/components/localContacts/localContacts.js";
import { LocalString } from "/components/local/local.js";
import { getCurrency } from "/components/blockchain/blockchain.js";
import { blockchainEndpoints } from "/config.js";

async function load() {
  return await local.loadHTML('/components/receiptHistory', 'receiptHistory.html');
}

const ready = load();

class ReceiptHistory extends HTMLElement {
  #user;
  #customReceiptHistory;

  #getItemName(item) {
    if (item.operation == 'to') return item.toName ?? item.to;
    return item.fromName ?? item.from;
  }

  #getAmount(item) {
    const am = item.output.amount;
    return am;
  }

  #getCurrencyName(item) {
    const blockchain = item.blockchain;
    const currency = item.output?.currency?.currency ?? item.output?.currency;
    if ((currency == null) && (blockchain == null)) return null;
    if (currency == null)
      return blockchain;
    if (blockchain == null)
      return currency;
    return `${currency} ( ${blockchain} )`;
  }

  #getCurrency(item) {
    const blockchain = item.output?.blockchain || item.blockchain;
    const currency = item.output?.currency?.currency ?? item.currency;
    if ((currency == null) && (blockchain == null)) return null;
    if (currency == null)
      return blockchain;
    return currency;
  }
  
  #showContent(array) {
    this.components.container.innerHTML = '';
    for (const key of array) {
      const item = window.document.createElement("receipthistory-item");
      item.operation = key.operation;
      item.date = key.date;
      item.icon = item.operation;
      item.name = this.#getItemName(key);
      item.currencyName = this.#getCurrencyName(key);
      item.currency = this.#getCurrency(key);
      item.amount = this.#getAmount(key);
      item.transferId = key.output.transactionHash || 'unknown';      
      item.networkFee = key.output.networkFee;
      item.serviceFee = key.output.serviceFee;
      this.components.container.appendChild(item);
    }
  }

  #checkAmount(item, amount) {
    if (amount == null) return true;          
    return (+amount == +item.amount);
  }

  #checkCurrency(item, currency) {
    if (currency == null) return true;          
    const cur = getCurrency(currency.toUpperCase());      
    return (item.output?.currency?.currency == cur.currency);
  }

  #checkFrom(item, from) {
    if (from == null) return true;
    const lfrom = from.toLowerCase();
    if (item.from?.toLowerCase() == lfrom) return true;
    if (item.fromName?.toLowerCase() == lfrom) return true;
    return false;
  }

  #checkTo(item, to) {
    if (to == null) return true;
    const lto = to.toLowerCase();
    if (item.to?.toLowerCase() == lto) return true;
    if (item.toName?.toLowerCase() == lto) return true;
    return false;
  }

  #checkTime(item, date) {
    if (date == null) return true;
    const { to, from } = date;
    return from < item.date && item.date < to;
  }

  #filterHistoryData(filterValues) {    
    const {from, to, amount, currency, date } = filterValues;
    const res = [];
    for (const item of this.#customReceiptHistory) {
      if (!this.#checkAmount(item, amount)) continue;
      if (!this.#checkCurrency(item, currency)) continue;
      if (!this.#checkFrom(item, from)) continue;
      if (!this.#checkTo(item, to)) continue;
      if (!this.#checkTime(item, date)) continue;
      res.push(item);
    }
        
    this.#showContent(res);            
  }

  #addActionParamToData(data) {    
    return data.map( item => {
      if (item.fromName == null) {
        const from = item.output?.result?.sender ?? item.output?.sender ?? item.output?.from ?? item.from;
        item.fromName = localContacts.resolveAddress(from);
      }

      if (item.toName == null) {
        const to = item.output?.result?.recipient ?? item.output?.recipient ?? item.output?.to ?? item.to;
        item.toName = localContacts.resolveAddress(to);
      }

      if (item.operation == null)
        item.operation = item.fromName == this.#user.wallet.name ? 'to' : 'from';
      return item;
    }).sort((a,b) => b.date - a.date);
  }

  #filterHandler = (event) => {
    this.#filterHistoryData(event.data);
  }

  async getHistory() {
    const promises = [];
    const functionSet = new Set();
    for (const key in blockchainEndpoints) {
      const bc = blockchainEndpoints[key];
      if (functionSet.has(bc.history.get)) continue;
      functionSet.add(bc.history.get);
      promises.push(bc.history.get(bc));
    }
    const res = await Promise.all(promises);
    return res.flat().sort((a,b) => a.date - b.date);
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    this.#user = users.getUser();
    try {
      if (this.#user == null)
      throw new Error('You are not authorized to view this page');
      this.components = {
        container: this.querySelector('.main-container'),
        btns: this.querySelectorAll('button'),
        filters: this.querySelector('speakease-filters'),
      };
      breadcrumbs.setTitle(new LocalString({
        en: 'Transaction History',
        ru: 'Transaction History',
        ko: '거래 내역'
      }));

      const hs = await this.getHistory();
      const cd = this.#addActionParamToData(hs);
      this.#customReceiptHistory = cd;
      this.#showContent(this.#customReceiptHistory);

      this.components.filters.addEventListener( 'changed', this.#filterHandler);

    } catch (e) {
      log(e);
      users.gotoHome();
      console.error(e);
    }
  }

  async disconnectedCallback() {
    this.components.filters.removeEventListener( 'changed', this.#filterHandler);
  }
}

async function receiptHistoryActivity() {
  const activity = new Activity({
    name: 'receiptHistory',
    text: new local.LocalString({
      en: 'Show history',
      ru: 'Посмотреть историю',
      ko: '거래 내역 보기',
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/receiptHistory.html',
    order: 2,
    top: ['activity', 'home'],
    type: 'info',
    description: new local.LocalString({
      en:'To view actual receipt history, say receipt history',
      ru:'Для просмотра актуальной истории транзакций произнесите - история транзакций',
      ko:'거래 내역을 보기 위해서 다음과 같이 말씀하십시오 - 거래 내역'
    })
  }, {
    check: async () => {
      if (!system.hasName()) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

function init() {
  receiptHistoryActivity();
}

init();

customElements.define("speakease-receipthistory", ReceiptHistory);
