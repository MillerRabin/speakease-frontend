

const template = `    
  <div class="wrapper">
    <div class="value-block">
      <div class="icon-block">
      <img class="img-icon">
      </div>
      <div class="name-block">
        <div class="short-name"></div>
      </div>
      <div class="analitic-block">
        <div class="analitic-block-img">
          <img src="/components/exchangeRates/images/green_up.png">
          <span>24H</span>
        </div>
        <div class="analitic-block-percent">0.03%</div>
      </div>
      <div class="exchange-value"></div>
    </div>
  </div>
`;

const formatters = {
  'US Dollar': new Intl.NumberFormat(window.navigator.language, { style: 'currency', currency: 'USD' })
}

class ExchangeRatesItem extends HTMLElement {
  #value;
  #shortName;
  #fullName
  #target;
  #key;
  #icon;
  #changes;

  #updateShortName() {
    if (this.components == null) return;
    this.components.shortName.innerHTML = this.#shortName;
  }

  #updateIcon() {
    if (this.components == null) return;
    this.components.icon.src = this.#icon;
  }

  #updatePrice() {
    if (this.components == null) return;
    let val = this.#value;
    const ftarget = formatters[this.target.name];
    const pstr = ftarget ? ftarget.format(val) : val;
    this.components.exchangeValue.innerHTML = pstr;
  }

  #updateDayChanges() {
    if (this.components == null) return;
    this.components.changesPercent.innerHTML = `${this.#changes}%`;
    this.components.changesPercentImg.src =  +this.#changes > 0 ? "/components/exchangeRates/images/green_up.png" : "/components/exchangeRates/images/red_down.png";
  }
  

  constructor() {
    super();
    const render = async (form) => {
      form._template = template
    };
    this.ready = render(this);
  }

  set price(value) {
    this.#value = Number(value);
  }

  get price() {
    return this.#value;
  }

  set shortName(value) {
    this.#shortName = value;
    this.#updateShortName();
  }

  get shortName() {
    return this.#shortName;
  }

  set changes(value) {
    this.#changes = value;
    this.#updateDayChanges();
  }

  get changes() {
    return this.#changes;
  }

  set icon(value) {
    if(!value) return
    this.#icon = `/components/cryptoicons/${value}.svg`;
    this.#updateIcon();
  }

  get icon() {
    return this.#icon;
  }

  set value(value) {
    this.#value = value;
    this.#updatePrice();
  }

  get value() {
    return this.#value;
  }

  set target(value) {
    this.#target = value;
    this.#updatePrice();
  }

  get target() { return this.#target;}

  set key(value) {
    this.#key = value;
  }

  get key() { return this.#key;}

  set active(value) {
    if (value)
      this.classList.add('active');
    else
      this.classList.remove('active');
  }

  get active() {
    return this.classList.contains('active');
  }

  async connectedCallback() {
    await this.ready;
    this.innerHTML = this._template;
    this.components = {
      shortName: this.querySelector('.short-name'),
      fullName: this.querySelector('.full-name'),
      exchangeValue: this.querySelector('.exchange-value'),
      icon: this.querySelector('.img-icon'),
      changesPercent: this.querySelector('.analitic-block-percent'),
      changesPercentImg: this.querySelector('.analitic-block-img img'),
    }

    this.#updatePrice();
    this.#updateShortName();
    this.#updateIcon();
    this.#updateDayChanges();
  }
}

customElements.define("exchangerates-item", ExchangeRatesItem);
