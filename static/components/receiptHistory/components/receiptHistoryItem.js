import router from  "/components/router/router.js";

const template = `
  <div class="name label"></div>
  <div class="line">
    <div class="left-block blocks">    
      <img class="operation">
    </div>
    <div class="currency-block">
      <div class="currency label"></div>
      <div class="amount label"></div>
    </div>  
    <div class="date label blocks"></div>  
    <div class="right-block blocks">&gt;</div>    
  </div>  
`;


class ReceiptHistoryItem extends HTMLElement {
  #operation;
  #date;
  #icon;
  #name;
  #currency;
  #currencyName;
  #amount;
  #transferId;
  #networkFee;
  #serviceFee;

  #getTransferLink({ name, amount, currency, date, transferId, networkFee, serviceFee, operation }) {
    const queries = [];
    if (name != null)
      queries.push(`contact=${name}`);
    if (amount != null)
      queries.push(`amount=${amount}`);
    if (currency != null)
      queries.push(`currency=${currency}`);
    if (date != null)
      queries.push(`date=${date}`);
    if (transferId != null)
      queries.push(`transferId=${transferId}`);
    if (networkFee != null)
      queries.push(`networkfee=${networkFee}`);
    if (serviceFee != null)
      queries.push(`servicefee=${serviceFee}`);
    if (operation != null)
      queries.push(`operation=${operation}`);
    return `/receipt.html${queries.length > 0 ? `?${queries.join('&')}` : ''}`;
  }

  #formatDate(date) {
    const dt  = new Date(date);
    const ld = dt.toLocaleDateString();
    const lt = dt.toLocaleTimeString();    
    return `${ld} <br> ${lt}`;
  }

  #updateName() {
    if (this.components == null) return;
    this.components.name.innerHTML = this.#name;
  }

  #updateDate() {
    if (this.components == null) return;
    this.components.date.innerHTML = this.#formatDate(this.#date);
  }

  #updateOperationIcon() {
    if (this.components == null) return;
    if (this.#icon == null) return;
    this.components.operationIcon.src = `/components/receiptHistory/images/${this.#icon}_icon.png`;
  }

  #updateCurrency() {
    if (this.components == null) return;
    const currency = this.#currencyName || this.#currency || 'unknown';
    this.components.currency.innerHTML = currency;
  }

  #updateAmount() {
    if (this.components == null) return;
    this.components.amount.innerHTML = this.#amount;
  }

  #enableClickToReceipt() {
    this.components.rightBlock.onclick = () => {
      const path = this.#getTransferLink({
        name: this.#name, 
        amount: this.#amount, 
        currency: this.#currency, 
        date: this.#date, 
        transferId: this.#transferId,
        networkFee: this.#networkFee,
        serviceFee: this.#serviceFee,
        operation: this.#operation,
      });
      router.goto(path);
    }
  }

    constructor() {
    super();
    const render = async (form) => {
      form._template = template
    };
    this.ready = render(this);
  }

  set operation(value) {
    this.#operation = value;
    this.#icon = value;
  }

  get operation() {
    return this.#operation;
  }

  set currency(value) {
    this.#currency = value;
  }

  get currency() {
    return this.#currency;
  }

  set currencyName(value) {
    this.#currencyName = value;
  }

  get currencyName() {
    return this.#currencyName;
  }

  set amount(value) {
    this.#amount = value;
  }

  get amount() {
    return this.#amount;
  }

  set date(value) {
    this.#date = value;
  }

  get date() {
    return this.#date;
  }

  set name(value) {
    this.#name = value;
  }

  get name() {
    return this.#name;
  }

  set transferId(value) {
    this.#transferId = value;
  }

  get transferId() {
    return this.#transferId;
  }

  set networkFee(value) { this.#networkFee = value; }
  get networkFee() { return this.#networkFee; }
  set serviceFee(value) { this.#serviceFee = value; }
  get serviceFee() { return this.#serviceFee; }

  async connectedCallback() {
    await this.ready;
    this.innerHTML = this._template;
    this.components = {
      name: this.querySelector('.name'),
      date: this.querySelector('.date'),
      operationIcon: this.querySelector('.left-block .operation'),
      currency: this.querySelector('.currency'),
      amount: this.querySelector('.amount'),
      rightBlock: this.querySelector('.right-block'),
    }

    this.#updateName();
    this.#updateDate();
    this.#updateOperationIcon();
    this.#updateCurrency();
    this.#updateAmount();
    this.#enableClickToReceipt();
  }
}

customElements.define("receipthistory-item", ReceiptHistoryItem);
