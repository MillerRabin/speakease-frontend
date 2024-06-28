import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import taskManager, { Task } from "/components/taskManager/taskManager.js";
import users from '/components/users/users.js';
import wallets from '/components/wallets/wallets.js';
import { getBalance,
  estimateTransferNetworkFee,
  format,
  getTransferFee,
  getCurrencyEndpoint,
  transfer,
  getUserKeys,
  getCurrency } from "/components/blockchain/blockchain.js";
import router from  "/components/router/router.js";
import localContacts from "/components/localContacts/localContacts.js";
import { LocalString } from "/components/local/local.js";

async function load() {
  return await local.loadHTML('/components/transferReview', 'transferReview.html');
}

const ready = load();

const localData = {
  title: new LocalString({
    en: 'Transfer Review',
    ru: 'Данные о Переводе',
    ko: '보내기 리뷰'
  }),
  'insufficient-funds': new LocalString({
    en: 'Insufficient funds for transaction',
    ru: 'Недостаточно средств для транзакции',
    ko: '트랜젝션을 위한 코인이 부족합니다'
  }),
  'wrongPassword': new LocalString({
    en: 'wrong',
    ru: 'неверный',
    ko: 'wrong'
  })
}

class TransferReview extends HTMLElement {
  #user;

  #contact = null;
  #contactName = null;
  #currency = null;
  #amount = null;  
  #date = null;
  #transferId = null;
  #networkFee;
  #serviceFee;
  #pincode;
  #validate =  false;
  #blockchain = null;

  #transferReviewTask = new Task({
      name: 'TransferReview',
      text: {
        en: 'TransferReview',
        ko: '보내기 리뷰'
      }
    }, {
      started:  (task) => {
        task.setStage('review');
      },
      'review': () => {
        this.#setStage('review');
      },
      'review-PasswordRequest': async (_, entities) => {
        if(!entities || entities.length == 0) return
        await this.#verifyPassword(entities, true);
      },
      'review-Approve': (task) => {
        task.setStage('transfer');
      },
      'transfer': async (task) => {
        this.#setStage('wait');
        try {
          this.#clearError();
          const res = await this.#transfer();
          task.setStage('success', res);
        } catch (e) {
          this.components.error.innerHTML = e.message;
          this.#setError(e);
          task.setStage('review');
        }
      },
      'success': (task, value) => {
        this.#setStage('success');
        setTimeout(() => {
          task.setStage('results', value);
        }, 3000)
      },
      'results': async (_, value) => {
        await this.#fillResults(value);
        let ms = this.#date.getTime();
        const receiptPath = this.#getTransferLink({
          name: this.#contact, 
          amount: this.#amount, 
          currency: this.#currency, 
          date: ms,
          transferId: this.#transferId,
          networkFee: this.#networkFee,
          serviceFee: this.#serviceFee
        })
        router.goto(receiptPath);
      }
    }
  );

  async #verifyPassword(value, voice = false){
    const password = voice ? await this.#getAndCheckPassword(value) : await wallets.verifyPinCode(this.#user.wallet, value);
    this.pincode = voice ? password : {text: value, validate: password};
  }

  getPasswords(entities) {
    const arr = [];
    const na = [];
    for (const ent of entities) {
      if (Array.isArray(ent)) 
        arr.push(ent.slice(1));
      else
        na.push(ent);
    }
    const cna = na.slice(1);
    arr.push(cna);
    return arr;
  }

  async #getAndCheckPassword(entities) {
    const passwords = this.getPasswords(entities);
    for(const arr of passwords) {
      const opt1 = arr.join('');
      const opt2 = arr.join(' ');
      const val2 = await wallets.verifyPinCode(this.#user.wallet, opt2);
      if(val2)
        return {text: opt2, validate: true };
      const val1 = await wallets.verifyPinCode(this.#user.wallet, opt2);
      if(val1)
        return {text: opt1, validate: true };
    }
    return {text: 'wrong', validate: false };
  }

  #estimateNetworkFee(recipient, amount) {
    const currency = this.#currency.currency
    return estimateTransferNetworkFee({ currency, recipient, amount, blockchain: this.blockchain });
  }

  #getCurrencyKeys() {
    const currency = this.currency?.currency ?? null;
    if (currency == null) return null;
    const keys = getUserKeys(currency);
    const endpoint = getCurrencyEndpoint(currency, this.#blockchain);
    return keys[endpoint.family];
  }

  #requestBalance() {
    const endpoint = getCurrencyEndpoint( this.currency.currency, this.blockchain );
    const keys = this.#getCurrencyKeys();
    return getBalance(endpoint, keys.public);
  }

  async #fillResults(value) {
    this.#transferId = value.output.transactionHash;
    this.#date = new Date();
  }

  #updateCurrency() {
    const cname = this.currency?.currency;
    if (cname == null) return;
    const lname = cname.toLowerCase();
    for (const icon of this.components.iconCurrencyArray) {
      icon.src = `/components/cryptoicons/${lname}.svg`;
    }
    for (const name of this.components.currencyNameArray) {
      name.innerHTML = cname;
    }
  }

  #getErrorText(error) {
    if (error.code == null) return error.message;
    const msg = localData[error.code];
    if (msg == null) return error.message;
    return msg.getText();
  }

  #setError(error) {
    this.classList.add('error');
    const text = this.#getErrorText(error);
    this.components.error.innerHTML = text;
  }

  #clearError() {
    this.classList.remove('error')
  }

  #updateContact() {    
    for(const item of this.components.contactValueArray) {
      item.innerHTML = this.#contactName;
    }
  }

  #resolveAddress(address) {
    const keys = this.#getCurrencyKeys();
    if (keys == null) return address;
    const mp = keys.publicText.toLowerCase();
    const lAddr = address.toLowerCase();
    if (mp == lAddr) return this.#user.wallet.name;    
    const contact = localContacts.getContactByAddress(address);
    if (contact != null) return contact;
    return address;
  }

  async #updateFees() {
    const currency = this.currency.currency;
    const networkFee = await this.#estimateNetworkFee(this.#contact, this.amount);
    const serviceFee = getTransferFee({ currency, amount: this.amount, blockchain: this.#blockchain });
    this.#networkFee = format({ currency, amount: networkFee, blockchain: this.blockchain });
    this.#serviceFee = serviceFee;
    this.components.networkFee.innerHTML = this.#networkFee;
    this.components.serviceFee.innerHTML = this.#serviceFee;
    const ta = Number(this.#networkFee) + Number(this.#serviceFee) + Number(this.amount);
    for (const total of this.components.totalValue) {
      total.innerHTML = ta; 
    }
  }

  async #getDetails() {
    const balance = await this.#requestBalance();
    const bl = Number(balance);
    if (isNaN(bl)) throw new Error('Balance is NaN');
    if (this.amount >= bl) {
      const err = new Error('You have not enough money to transfer');
      err.code = 'not-enough-money';
      throw err;
    }
    const cr = this.currency.currency;    
    return { currency: cr, recipient: this.contact, amount: this.amount, serviceFee: this.#serviceFee, blockchain: this.blockchain };
  }

  async #transfer() {
    const dt = await this.#getDetails();
    const res = await transfer(dt);
    return {
      input: dt,
      output: res
    }  
  }

  #updateAmount() {
    if (this.components == null) return;
    for(const item of this.components.amountValueArray) {
      item.innerHTML = this.amount;
    }    
  }

  #updatePincode() {
    if (this.components == null) return;
    this.#validate = this.pincode.validate;
    this.components.password.value = this.#validate ? this.pincode.text : '';
    if(!this.#validate) {
      this.components.password.classList.add('wrong');
      setTimeout(() => this.components.password.classList.remove('wrong'), 1000)
    }
    this.#update();
  }

  #update() {
    this.components.approveBtn.disabled = !this.#validate;
  }

  set contact(value) {      
    this.#contact = value;
    this.#contactName = this.#resolveAddress(value);
    this.#updateContact();    
  }

  get contact() {
    return this.#contact;
  }

  set currency(value) {
    const currency = getCurrency(value);
    if (currency == null) throw new Error(`Currency ${value} is not supported`);
    this.#currency = currency;
    this.#updateCurrency();
  }

  get currency() {
    return this.#currency;
  }

  set amount(value) {
    this.#amount = value;
    this.#updateAmount();
  }

  get amount() { return this.#amount; }
  set blockchain(value) { this.#blockchain = value; }

  get blockchain() {
    return this.#blockchain;
  }

  set pincode(value) {
    this.#pincode = value;
    this.#updatePincode();
  }

  get pincode() {
    return this.#pincode;
  }

  async #setStage(stage) {
    this.classList.remove('review', 'wait', 'success');
    switch (stage) {
      case 'review':
        this.classList.add('review');
        break;
      case 'wait':
        this.classList.add('wait');
        break;
      case 'success':
        this.classList.add('success');
        break;
      default:
        throw new Error(`Stage ${stage} is not supported`);
    }
  }

  #enableStageBtns() {
    this.components.approveBtn.onclick = async () => {
      this.#transferReviewTask.setStage('transfer');
    }
  }

  #goBack() {
    router.goto({ name: 'transfer' });
  }

  #getUrlParams() {
    const params = new URL(window.location);
    this.currency = params.searchParams.get('currency') || null;
    this.blockchain = params.searchParams.get('blockchain') || null;
    this.contact = params.searchParams.get('recipient') || null;   
    this.amount = params.searchParams.get('amount') || null;
  }

  #getTransferLink({ 
    name, 
    amount, 
    currency, 
    date, 
    transferId, 
    serviceFee, 
    networkFee 
  }) {
    const queries = [];
    if (name != null)
      queries.push(`contact=${name}`);
    if (amount != null)
      queries.push(`amount=${amount}`);
    if (currency != null)
      queries.push(`currency=${currency.currency}`);
    if (date != null)
      queries.push(`date=${date}`);
    if (transferId != null)
      queries.push(`transferId=${transferId}`);
    if (serviceFee != null)
      queries.push(`servicefee=${serviceFee}`);
    if (networkFee != null)
      queries.push(`networkfee=${networkFee}`);
    return `/receipt.html${queries.length > 0 ? `?${queries.join('&')}` : ''}`;
  }

  async #startTask() {
    taskManager.startExclusive(this.#transferReviewTask);
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
        secondStageSendingValue: this.querySelector('.sending-value'),
        secondStageSecondValueInfo: this.querySelector('.second-value-info'),
        secondStageTotalAmount: this.querySelector('.second-stage .amount-block-value'),
        amountValueArray: this.querySelectorAll('.amount-value'),
        approveBtn: this.querySelector('.approve'),
        contactValueArray: this.querySelectorAll('.contact-value'),
        iconCurrencyArray: this.querySelectorAll('.icon-currency-img'),
        currencyNameArray: this.querySelectorAll('.currency-name'),
        serviceFee: this.querySelector('.service-fee'),
        networkFee: this.querySelector('.network-fee'),
        totalValue: this.querySelectorAll('.total'),
        error: this.querySelector('.error'),
        password: this.querySelector('.password'),
      };

      breadcrumbs.setTitle(localData.title.getText());
      await speechDispatcher.attachTask(this.#transferReviewTask);      
      
      this.#enableStageBtns();
      this.components.backBtn.onclick = () => {
        this.#goBack();
      };

      this.components.password.onchange = (ev) => {
        this.#verifyPassword(ev.target.value);
      };

      setTimeout(async () => {
        this.#getUrlParams();
        this.#updateAmount();
        this.#updateCurrency();
        this.#updateContact();
        await this.#updateFees();
        await this.#startTask();
        router.updateRouteLinks();
      });          
    } catch (e) {
      console.error(e);
      this.#goBack();
    }

  }

  async disconnectedCallback() {
    taskManager.end(this.#transferReviewTask);
  }
}

customElements.define("speakease-transferreview", TransferReview);
