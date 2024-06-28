import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import taskManager, { Task } from "/components/taskManager/taskManager.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import users from '/components/users/users.js';
import system from '/components/system/system.js';
import router from  "/components/router/router.js";
import { hasStoragePermissions } from "/components/permissions/permissions.js";
import { getBalance,
  estimateTransferNetworkFee,
  format,
  getTransferFee,
  nativeFormat,
  getUserKeys,
  getBlockchainFamily, 
  getCurrency, 
  getCurrencies 
} from "/components/blockchain/blockchain.js";
import localContacts from "/components/localContacts/localContacts.js";
import { LocalString } from "../local/local.js";
import koNLP from "../koNLP/koNLP.js";
import "/intentions/blockchainTypes/blockchainTypes.js";


async function load() {
  return await local.loadHTML('/components/transfer', 'transfer.html');
}

const ready = load();

const localData = {
  'title': new LocalString({
    en: `Transfer`,
    ru: `Перевод`,
    ko: `보내기`
  }),
  'contact-not-found': new LocalString({
    en: `
      <p>Contact <span class="contact">{{contact}}</span> does not contain record for {{family}} family blockchains.</p>
      <p>Please add {{family}} record for contact <span class="contact">{{contact}}</span>.</p>
      <p>It's necessary to transfer {{currency}} to <span class="list">{{blockchainList}}</span></p>`,
    ru: `
      <p>Контакт <span class="contact">{{contact}}</span> не содержит запись для {{family}} совместимых блокчейнов.</p> 
      <p>Пожалуйста, добавьте {{family}} запись для контакта <span class="contact">{{contact}}</span>.</p>
      <p>Это необходимо чтобы делать платежи в валюте <span class="contact">{{currency}}</span> 
         для блокчейнов <span class="list">{{blockchainList}}</span>
      </p>
    `,
    ko: `
      <p><span class="contact">{{contact}}</span>에는 {{family}} 주소가 없습니다.</p>
      <p><span class="contact">{{contact}}</span>에 {{family}} 주소를 추가해 주세요.</p>
      <p>{{currency}} <span class="list">{{blockchainList}}</span>으로 보내기위해 필요합니다</p>`,
    format: {
      en: (ltext, values) => 
                ltext.replaceAll('{{family}}', values.family)
                  .replaceAll('{{contact}}', values.contact)
                  .replaceAll('{{currency}}', values.currency)
                  .replaceAll('{{blockchainList}}', values.blockchainList),
      ru: (ltext, values) => 
                ltext.replaceAll('{{family}}', values.family)
                  .replaceAll('{{contact}}', values.contact)
                  .replaceAll('{{currency}}', values.currency)
                  .replaceAll('{{blockchainList}}', values.blockchainList),
      ko: (ltext, values) => 
                ltext.replaceAll('{{family}}', values.family)
                  .replaceAll('{{contact}}', values.contact)
                  .replaceAll('{{currency}}', koNLP.addObjectParticle(values.currency))
                  .replaceAll('{{blockchainList}}', values.blockchainList)
  }
  }),
  'not-enough-money': new LocalString({
    en: `
      <p>You have no money to make this transfer</p>
      <p>Total amount is a sum of <span class="sum">amount</span>, <span class="sum">service fee</span> and <span class="sum">network fee</span></p>`,
    ru: `
      <p>У вас недостаточно денег для транзакции</p> 
      <p>Итоговая сумма - это <span class="sum">сумма перевода</span> + <span class="sum">сервисный сбор</span> + <span class="sum">сетевой сбор</span></p>
    `,
    ko: `
      <p>보유 코인 수량이 부족합니다</p>
      <p>합계는 <span class="sum">전송량</span>, <span class="sum">서비스 수수료</span> 그리고 <span class="sum">네트워크 수수료</span>의 총 합입니다</p>`,
  })
}

class Transfer extends HTMLElement {
  #contacts = null;
  #user;

  #currencyCustom = getCurrencies();

  #contact = null;
  #currency = null;
  #amount = null;
  #balance = null;

  #transferTask = new Task({
      name: 'Transfer',
      text: {
        en: 'Transfer',
        ru: 'Трансфер',
        ko: '보내기',
      }
    }, {
      started:  (task) => {
        task.setStage('prepare');
      },
      'prepare': () => {},
      'prepare-Currency': (_, currency) => {
        this.currency = currency.value.currency;
      },
      'prepare-Blockchain': (_, blockchain) => {
        const name = blockchain.value.name.toLowerCase();
        this.#selectBlockchain(name);

      },
      'prepare-Contact': (_, contact) => {
        this.contact = contact.value;
      },
      'prepare-Approve': (task) => {
        task.setStage('review');
      },
      'prepare-Amount': (_, amount) => {
        this.amount = amount.value;
      },
      'review': async (task) => {
        try {
          const details = await this.#getDetails();
          this.#gotoReview(details);
        } catch (e) {
          task.setStage('prepare');
        }
      }
    }
  );

  #requestBalance() {
    const cur = getCurrency(this.#currency.toUpperCase());
    const bc = this.components.blockchainSelect.value;
    const blockchain = cur.blockchains[bc.toLowerCase()];
    try {
      const keys = getUserKeys(this.#currency);
      const tKey = keys[blockchain.family];
      return getBalance(blockchain, tKey.public);
    } catch (e) {
      console.log('user',this.#user);
      console.log('cur',cur);
      throw new Error(e);
    }
  }

  #estimateNetworkFee(recipient, amount) {
    const blockchain = this.#getBlockchain();
    return estimateTransferNetworkFee({ currency: this.#currency, blockchain, recipient, amount });
  }

  #selectBlockchain(val) {
    const blockchainSelect = this.components.blockchainSelect;
    blockchainSelect.value = val; 
    if (blockchainSelect.value != '') return;
    const first = blockchainSelect.firstChild;
    if (first == null) return;
    blockchainSelect.value = first.value;
  }

  #getBlockchain() {
    const bc = this.components.blockchainSelect.value;
    if (bc != '') return bc;
    return null;
  }

  #fillBlockchains() {
    const currency = getCurrency(this.#currency);
    if (currency == null) return;
    const blockchainSelect = this.components.blockchainSelect;
    const val = blockchainSelect.value;
    blockchainSelect.innerHTML = '';
    for (const bKey in currency.blockchains) {
      const bc = currency.blockchains[bKey];
      const option = window.document.createElement('option');
      option.value = bKey;
      option.innerHTML = bc.name;
      blockchainSelect.appendChild(option);
    }
    this.#selectBlockchain(val);
  }

  #updateBlockchains() {
    if (this.#currency == null) return;
    this.components.currencyAmount.value = '--';
    this.#balance = null;
    this.#requestBalance().then((bal) => {
      this.#balance = bal;
      this.components.currencyAmount.value = bal;
    });
  }

  #updateCurrency() {
    if (this.components == null) return;
    this.components.currencySelect.value = this.#currency;
    if (this.#currency == null) return;
    const currency = getCurrency(this.#currency);
    if (currency == null) return;
    this.#fillBlockchains(this.#currency);
    this.#updateBlockchains();
   
  }

  #updateContact() {
    if (this.components == null) return;
    this.components.contactSelect.value = this.contact;
  }
  
  async #getDetails() {
    if (this.#amount == null) throw new Error('Amount is null');
    const amount = Number(this.#amount);
    if (isNaN(amount)) throw new Error('Amount is NaN');
    if (amount == 0) throw new Error('Amount is zero');
    if (this.#balance == null) throw new Error('Balance is null');
    const bl = Number(this.#balance);
    if (isNaN(bl)) throw new Error('Balance is NaN');
    if (amount >= bl) {
      const err = new Error('You have not enough money to transfer');
      err.code = 'not-enough-money';
      throw err;
    }
    const cr = this.currency;
    const ct = this.contact;
    const blockchain = this.#getBlockchain();
    const cFamily = getBlockchainFamily(blockchain);
    const recipient = localContacts.findContact(ct, cFamily);
    const networkFee = await this.#estimateNetworkFee(recipient, amount);
    const serviceFee = getTransferFee({ currency: cr, amount, blockchain });
    return { currency: cr, blockchain, recipient, amount: nativeFormat({ currency: cr, amount, blockchain }), networkFee, serviceFee };
  }

  #updateAmount() {
    if (this.components == null) return;
    this.components.transferAmount.value = this.#amount;    
    this.#update();
  }

  #updateSelects() {
    this.#updateAmount();
    this.#updateContact();
    this.#updateCurrency();
    this.#update();
  }

  set contact(value) {
    if (value == null) return;
    this.#contact = value;
    this.#updateContact();
    this.#update();
  }

  get contact() {
    return this.#contact;
  }

  set currency(currency) {
    if (currency == null) return;
    this.#currency = currency.toUpperCase();
    this.#updateCurrency();
    this.#update();
  }

  get currency() {
    return this.#currency;
  }

  set amount(value) {
    if (value == null) return;
    this.#amount = value;
    this.#updateAmount();
  }

  get amount() {
    return this.#amount;
  }

  async #fulfilContactsSelect(form, items) {
    for (const key in items) {
      const item = window.document.createElement("option");
      item.innerText = key;
      item.value = key;
      form.components.contactSelect.appendChild(item);
    }
  }

  async #fulfilCurrencySelect(form, items) {
    for (const key of items) {
      const item = window.document.createElement("option");
      item.innerText = key.currency;
      item.value = key.currency;
      form.components.currencySelect.appendChild(item);
    }
  }

  #gotoReview(details) {
    router.goto(`/transferReview.html?currency=${details.currency}&recipient=${details.recipient}&blockchain=${details.blockchain}&amount=${format({ currency: details.currency, amount: details.amount, blockchain: details.blockchain })}`);
  }

  #enableReviewBtn() {
    this.components.reviewBtn.onclick = () => {
      this.#transferTask.setStage('review');
    };
  }

  #getUrlParams() {
    const params = new URL(window.location);
    this.contact = params.searchParams.get('name') || null;
    this.currency = params.searchParams.get('currency') || null;
    this.amount = params.searchParams.get('amount') || null;
  }

  async #update() {
    this.components.reviewBtn.disabled = !(await this.#canTransfer());
  }

  async #startTask() {
    taskManager.startExclusive(this.#transferTask);
  }

  #getCurrencyInfo() {
    const res = {
      currency: null,
      family: null,
      blockchainList: null
    }
    if (this.#currency == null) return res;
    const currency = getCurrency(this.#currency);
    if (currency == null) return res;
    const bc = this.#getBlockchain();
    res.family = getBlockchainFamily(bc);    
    res.currency = currency.currency;     
    const bcs = Object.values(currency.blockchains);
    const bstr = bcs.map(c => c.name).join(', ');    
    res.blockchainList = bstr;
    return res;
  }

  #getErrorText(error) {
    if (error.code == null) return error.message;
    const lstr = localData[error.code];
    if (lstr == null) return error.message;
   const ci = this.#getCurrencyInfo();
   const fstr = lstr.format({       
      contact: this.#contact,
      currency: ci.currency,
      blockchainList: ci.blockchainList,
      family: ci.family
    });
    return fstr.getText();
  }

  #setError(error) {
    if (error.code == null) return
    this.classList.add('error');
    this.classList.add(error.code);
    const text = this.#getErrorText(error);
    this.components.error.innerHTML = text;
  }

  #clearError() {
    this.className = '';
  }

  async #canTransfer() {
    try {
      this.#clearError();
      const details = await this.#getDetails();
      const nf = format({ currency: details.currency, amount: details.networkFee, blockchain: details.blockchain });
      this.components.networkFee.innerHTML = nf;
      this.components.serviceFee.innerHTML = details.serviceFee;
      this.components.totalValue.innerHTML = +nf + +details.serviceFee;
      return true;
    } catch(e) {      
      this.#setError(e);              
      this.components.networkFee.innerHTML = '--';
      this.components.serviceFee.innerHTML = '--';
      this.components.totalValue.innerHTML = '--';
      return false;
    }
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    try {
      this.#user = users.getUser();
      if (this.#user == null)
        throw new Error('You are not authorized');

      this.components = {
        container: this.querySelector('.container'),
        backBtn: this.querySelector('.back-btn'),
        contactSelect: this.querySelector('#contactSelect'),
        blockchainSelect: this.querySelector('#blockchainSelect'),
        currencySelect: this.querySelector('#currencySelect'),
        currencyAmount: this.querySelector('.currency-amount'),
        transferAmount: this.querySelector('.transfer-amount'),
        serviceFee: this.querySelector('.service-fee'),
        networkFee: this.querySelector('.network-fee'),
        totalValue: this.querySelector('.total'),        
        reviewBtn: this.querySelector('.review'),
        error: this.querySelector('.error-block'),
      };
      
      breadcrumbs.setTitle(localData.title.getText());
      await speechDispatcher.attachTask(this.#transferTask);      
      this.#contacts = localContacts.get();
      await this.#fulfilContactsSelect(this, this.#contacts);
      await this.#fulfilCurrencySelect(this, this.#currencyCustom);
      this.#updateSelects();
      this.#enableReviewBtn();

      this.components.currencySelect.onchange = (ev) => {
        this.currency = ev.target.value;
      }

      this.components.blockchainSelect.onchange = () => {
        this.#updateBlockchains()
      }

      this.components.backBtn.onclick = () => {
        users.gotoHome();
      };

      this.components.contactSelect.onchange = (ev) => {
        this.contact = ev.target.value;
      }

      this.components.transferAmount.onkeyup = (ev) => {
        this.amount = ev.target.value;
      }

      setTimeout(async () => {
        try {
          this.#getUrlParams();
          this.#updateAmount();
          await this.#startTask();
          router.updateRouteLinks();
        } catch (e) {
          console.error(e);
          router.goto('/');
        }
      });          
    } catch (e) {
      console.error(e);
      router.goto('/');
    }

  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#transferTask);
    taskManager.end(this.#transferTask);
  }
}

async function transferActivity() {
  const activity = new Activity({
    name: 'transfer',
    text: new local.LocalString({
      en: 'Send Crypto',
      ru: 'Переслать крипту',
      ko: '코인 보내기',
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/transfer.html',
    top: ['activities', 'home'],
    order: 1,
    type: 'general',
    description: new local.LocalString({
      en:'To transfer, say make transfer',
      ru:'Для перевода валют скажите - сделать перевод',
      ko:'코인을 보내시려면 다음과 같이 말씀해 주세요 - 코인 보내기'
    })
  }, {
    check: async function () {
      const cr = await router.current();
      if (cr.name == 'transfer') return false;
      if (!system.hasName()) return false;
      const hs = await hasStoragePermissions();
      if (!hs) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

function init() {
  transferActivity();
}

init()

customElements.define("speakease-transfer", Transfer);