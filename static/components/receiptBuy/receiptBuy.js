import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local from "/components/local/local.js";
import "/components/exchangeRates/components/exchangeRatesItem.js";
import { getCurrency } from "/intentions/cryptoTypes/main.js";
import "/components/preloader/preloader.js";
import clipboard from "../clipboard/clipboard.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";

async function load() {
  return await local.loadHTML('/components/receiptBuy', 'receiptBuy.html');
}

const ready = load();

class ReceiptBuy extends HTMLElement {
  #provider;
  #fiat;
  #amount;
  #buyAmount;
  #currency;
  #date;
  #transferId;
  #serviceFee;
  #networkFee;
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
    this.provider = params.searchParams.get('provider') || null;
    this.amount = params.searchParams.get('amount') || null;
    this.buyAmount = params.searchParams.get('buyAmount') || null;
    this.fiat = params.searchParams.get('fiat') || null;
    this.date = params.searchParams.get('date') || null;
    this.transferId = params.searchParams.get('transferId') || null;
    this.serviceFee = params.searchParams.get('servicefee') || 0;
    this.networkFee = params.searchParams.get('networkfee') || 0;
  }

  #updateTransferId() {
  this.components.transferIdLabel.innerHTML = this.#transferId;
  }

  #updateProvider() {
    this.components.imgProvider.src = `/components/receiptBuy/images/${this.#provider}.png`;
    // this.components.providerValue.innerHTML = this.#provider;
  }

  #updateCurrency() {
    this.components.currencyName.innerHTML = this.currency.value.currency;
  }

  async #updateDate() {
    this.components.dateValue.innerHTML = await this.#formatDate(+this.#date);
  }

  #updateAmount() {
    for(const value of this.components.amountValuesWithCurr) {
      value.innerHTML = `${this.amount} ${this.currency.value.currency}`;
    }
  }

  #updateBuyAmount() {
    this.components.firstAmountValue.innerHTML = this.buyAmount;
  }

  #updateFiat() {

  }

  set provider(value) {      
    this.#provider = value;
    this.#updateProvider();    
  }

  get provider() {
    return this.#provider;
  }

  #updateFee() {
    this.components.serviceFee.innerHTML = `${this.#serviceFee} ${this.currency.value.currency.toLowerCase()}`;
    this.components.networkFee.innerHTML = `${this.#networkFee} ${this.currency.value.currency.toLowerCase()}`;
    this.components.total.innerHTML = `${Number(this.networkFee) + Number(this.serviceFee) + Number(this.amount)} ${this.fiat}`;
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
    this.#amount = value
    this.#updateAmount();
  }

  get amount() {
    return this.#amount;
  }

  set buyAmount(value) {
    this.#buyAmount = value
    this.#updateBuyAmount();
  }

  get buyAmount() {
    return this.#buyAmount;
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

  set fiat(value) {
    this.#fiat = value;
    this.#updateFiat();
  }

  get fiat() {
    return this.#fiat;
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    this.components = {
      container: this.querySelector('.container'),
      loader: this.querySelector('speakease-preloader'),
      iconCurrency: this.querySelector('.icon-currency-img'),
      transferIdLabel: this.querySelector('.transfer-id-label .value'),
      providerValue: this.querySelector('.provider-value'),
      firstAmountValue: this.querySelector('.first-block .amount-value'),
      amountValuesWithCurr: this.querySelectorAll('.amount-value.with-currency'),
      dateValue: this.querySelector('.date-block .value'),
      currencyName: this.querySelector('.currency-name'),
      serviceFee: this.querySelector('.servicefee'),
      networkFee: this.querySelector('.networkfee'),
      total: this.querySelector('.total'),
      notification: this.querySelector('.notification-block'),
      imgProvider: this.querySelector('.img-provider'),
    };
    breadcrumbs.setTitle('Receipt');
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

customElements.define("speakease-receiptbuy", ReceiptBuy);
