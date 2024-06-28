import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local, { LocalString } from "/components/local/local.js";
import "/components/exchangeRates/components/exchangeRatesItem.js";
import { getCurrency } from "/intentions/cryptoTypes/main.js";
import "/components/preloader/preloader.js";
import localContacts from "/components/localContacts/localContacts.js";
import clipboard from "../clipboard/clipboard.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";

async function load() {
  return await local.loadHTML('/components/receipt', 'receipt.html');
}

const ready = load();

class Receipt extends HTMLElement {
  #contact;
  #contactName;
  #amount;
  #currency;
  #date;
  #transferId;
  #serviceFee;
  #networkFee;
  #operation;
  #copyTask = new Task({
      name: 'Copy transaction hash',
      text: {
        en: 'Copy transactrion hash',
        ru: 'Копировать хеш транзакции',
        ko: '트랜잭션 해시 복사'
      }
    }, {
      started: async (task) => {
        task.setStage('copyHash?', null, false);
      },
      'copyHash?-Copy': () => {
        this.#copyHash();
      }
    }
  );


  #formatDate(date) {
    const dt  = new Date(date);
    const ld = dt.toLocaleDateString();
    const lt = dt.toLocaleTimeString();    
    return `${ld} <br> ${lt}`;
  }

  #getUrlParams() {
    const params = new URL(window.location);
    this.currency = params.searchParams.get('currency') || null;
    this.contact = params.searchParams.get('contact') || null;
    this.amount = params.searchParams.get('amount') || null;
    this.date = params.searchParams.get('date') || null;
    this.transferId = params.searchParams.get('transferId') || null;
    this.serviceFee = params.searchParams.get('servicefee') || 0;
    this.networkFee = params.searchParams.get('networkfee') || 0;
    this.operation = params.searchParams.get('operation') || 'to';
  }

  #updateTransferId() {
  this.components.transferIdLabel.innerHTML = this.#transferId;
  }

  #updateContact() {
    this.components.contactValue.innerHTML = this.#contactName;
  }

  #updateCurrency() {
    this.components.currencyName.innerHTML = this.currency.value.currency;
  }

  async #updateDate() {
    this.components.dateValue.innerHTML = await this.#formatDate(+this.#date);
  }

  #updateAmount() {
    this.components.firstAmountValue.innerHTML = this.amount;
    for(const value of this.components.amountValuesWithCurr) {
      value.innerHTML = `${this.amount} ${this.currency.value.currency}`;
    }
  }

  #resolveAddress(address) {
    return localContacts.resolveAddress(address, this.currency.value.currency);    
  }


  set contact(value) {      
    this.#contact = value;
    this.#contactName = this.#resolveAddress(value);
    this.#updateContact();    
  }

  get contact() {
    return this.#contact;
  }

  #updateFee() {
    this.components.serviceFee.innerHTML = this.#serviceFee;
    this.components.networkFee.innerHTML = this.#networkFee;
    this.components.total.innerHTML = Number(this.networkFee) + Number(this.serviceFee) + Number(this.amount);
  }

  #updateOperation() {
    this.components.operation.innerHTML = this.#operation?.replace(
      /^\w{1}/,
      (match) => match.toUpperCase()
    );
    this.components.operationAction.innerHTML = this.#operation === 'to' ? 'Send' : 'Received';
    this.components.operationActionIcon.src = `/components/receiptHistory/images/${this.#operation}_icon.png`;
  }

  set networkFee(value) {
    this.#networkFee = value;
    this.#updateFee();
  }

  get networkFee() {
    return this.#networkFee;
  }

  set serviceFee(value) {
    this.#serviceFee = value;
    this.#updateFee();
  }

  get serviceFee() {
    return this.#serviceFee;
  }

  set amount(value) {
    this.#amount = value;
    this.#updateAmount();
  }

  get amount() {
    return this.#amount;
  }

  set operation(value) {
    this.#operation = value;
    this.#updateOperation();
  }

  get operation() {
    return this.#operation;
  }

  set currency(value) {
    this.#currency = getCurrency(value);
    this.components.iconCurrency.src = `/components/cryptoicons/${this.#currency.value.currency.toLowerCase()}.svg`
    this.#updateCurrency();
  }

  get currency() {
    return this.#currency;
  }

  set date(value) {
    this.#date = value;
    this.#updateDate();
  }

  get date() {
    return this.#date;
  }

  set transferId(value) {
    this.#transferId = value;
    this.#updateTransferId();
  }

  get transferId() {
    return this.#transferId;
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    this.components = {
      container: this.querySelector('.container'),
      loader: this.querySelector('speakease-preloader'),
      iconCurrency: this.querySelector('.icon-currency-img'),
      transferIdLabel: this.querySelector('.transfer-id-label .value'),
      contactValue: this.querySelector('.contact-value'),
      firstAmountValue: this.querySelector('.first-block .amount-value'),
      amountValuesWithCurr: this.querySelectorAll('.amount-value.with-currency'),
      dateValue: this.querySelector('.date-block .value'),
      currencyName: this.querySelector('.currency-name'),
      serviceFee: this.querySelector('.servicefee'),
      networkFee: this.querySelector('.networkfee'),
      total: this.querySelector('.total'),
      notification: this.querySelector('.notification-block'),
      operation: this.querySelector('.operation'),
      operationAction: this.querySelector('.operation-action'),
      operationActionIcon: this.querySelector('.operation-action-icon img'),
    };
    breadcrumbs.setTitle(new LocalString({
      en: 'Receipt',
      ru: 'Receipt',
      ko: '영수증'
    }));
    setTimeout(() => {
      this.#getUrlParams()
      }, 0);
    this.components.transferIdLabel.onclick = () => {
      this.#copyHash();
    }
    await speechDispatcher.attachTask(this.#copyTask);
    await this.#startTask();
  }

  async disconnectedCallback() {
      speechDispatcher.detachTask(this.#copyTask);
      taskManager.end(this.#copyTask);
  }

  #copyHash() {
      const transferId = this.components.transferIdLabel.innerHTML;
      clipboard.write(transferId);
      this.components.notification.style.display = 'block';
      setTimeout(() => {
        this.components.notification.style.display = 'none';
      }, 5000)
  }

  async #startTask() {
    taskManager.startExclusive(this.#copyTask);
  }
}

customElements.define("speakease-receipt", Receipt);
