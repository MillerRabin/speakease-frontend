const template = `      
  <div class="name-and-net">
    <div class="name"></div>
    <div class="net"></div>
  </div>
  <div class="icon-and-value">
    <div class="img-block">
      <img src="/pages/walletBalance/images/bitcoin_logo.png">
    </div>
    <div class="coin-value">--</div>
  </div>
`;

class WalletBalanceItem extends HTMLElement {
  #value;
  #name;
  #img;
  #net;
  #timerId;
  #delay = 10000;

  async #updateValue() {
    const value = await this.#value();
    if (this.components != null) {
      this.components.value.innerHTML = value;
      this.components.value.title = value;  
    }
    this.#timerId = setTimeout(() => {
      this.#updateValue();
    }, this.#delay);
  }

  #updateImg() {
    if (this.components != null) 
      this.components.img.src = this.#img;
  }

  #updateName() {
    if (this.components != null) 
      this.components.name.innerHTML = this.#name;
  }

  #updateNet() {
    if (this.components != null) 
      this.components.net.innerHTML = this.#net;
  }

  constructor() {
    super();
    const render = async (form) => {
      form._template = template
    };
    this.ready = render(this);
  }

  set img(value) {
    this.#img = value;
    this.#updateImg();
    
  }

  get img() {
    return this.#img;
  }

  get value() {
    return this.#value;
  }

  set value(value) {
    clearInterval(this.#timerId);
    this.#value = value;
    this.#updateValue();
  }

  set name(value) {
    this.#name = value;
    this.#updateName();
  }

  get name() {
    return this.#name;
  }

  set net(value) {
    this.#net = value;
    this.#updateNet();
  }

  get net() {
    return this.#net;
  }

  async connectedCallback() {
    await this.ready;
    this.innerHTML = this._template;
    this.components = {
      img: this.querySelector('img'),
      value: this.querySelector('.coin-value'),
      name: this.querySelector('.name'),
      net: this.querySelector('.net'),
    }
    this.#updateImg();
    this.#updateName();
    this.#updateNet();
  }

  disconnectedCallback() {
    clearInterval(this.#timerId);
  }
}

customElements.define("walletbalance-item", WalletBalanceItem);
