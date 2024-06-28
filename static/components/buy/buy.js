import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local, { LocalString } from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import taskManager, { Task } from "/components/taskManager/taskManager.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import users from '/components/users/users.js';
import system from '/components/system/system.js';
import router from  "/components/router/router.js";
import { hasStoragePermissions } from "/components/permissions/permissions.js";
import { 
  getProviders, 
  getCurrencyBlockchains, 
  getProviderCryptoCurrencies, 
  getProviderFiatCurrencies, 
  getProviderBuyCryptoPrice 
} from "/components/blockchain/blockchain.js";
import '/intentions/fiatTypes/fiatTypes.js';
import '/intentions/providerTypes/providerTypes.js';
import { getLocale } from "/utils/getLocale.js";


async function load() {
  return await local.loadHTML('/components/buy', 'buy.html');
}

const ready = load();

const localData = {
  'title': new LocalString({
    en: `Buy`,
    ru: `Покупка`,
    ko: `Buy`
  })
};

class Buy extends HTMLElement {  
  #user;  
  #fiatAmount = 0;
  #fiatCurrencies = null;
  #showError = false;
  #country = null;
  
  #buyTask = new Task({
      name: 'Buy Crypto',
      text: {
        en: 'Buy Crypto',
        ru: 'Купить крипту'        
      }
    }, {
      started:  (task) => {
        task.setStage('prepare');
      
      },
      'prepare': () => {},
      'prepare-Currency': (_, currency) => {
        if (currency.value.family == null) return;
        this.currency = currency.value.currency;
      },      
      'prepare-Fiat': (_, fiat) => {
        this.fiat = fiat[0].value.name;
      },
      'prepare-Buy': (task, value) => {
        this.#showError = true;
        this.operation = Array.isArray(value) ? value[0].value : value.value;
      },
      'prepare-Approve': (task) => {
        task.setStage('review');
      },
      'prepare-Delete': () => {
        const blank = '';
        this.components.conversionRate.innerHTML = blank;
        this.components.fiatAmount.innerHTML = blank;
        this.components.cryptoAmount.innerHTML = blank;
        this.components.totalFee.innerHTML = blank;
        this.components.wantToSpend.value = blank;
        this.components.wantToBuy.value = blank;
        this.#clearReports();
      },
      'prepare-Amount': (_, amount) => {
        this.amount = amount.value;
        if (this.operation == 'spend') {
          this.wantToSpend = amount.value;
        } else {
          this.wantToBuy = amount.value;
        }
        this.#requestUpdate(true);
      },
      'prepare-Provider': (_, provider) => {
        this.provider = provider[0].value.name;
      },
      'review': async (task) => {
        try {
          this.#gotoReview();
        } catch (e) {
          task.setStage('prepare');
        }
      }
    }
  );

  #enableReviewBtn() {
    this.components.reviewBtn.onclick = () => {
      this.#buyTask.setStage('review');
    };
  }
  
  async #getDetails() {
    const params = { 
      provider: this.provider, 
      cryptoCurrency: this.currency, 
      fiatCurrency: this.fiat,             
      blockchain: this.blockchain,
      paymentOption: this.paymentType
    };
    if (this.operation === 'spend') {
      params.fiatAmount = this.wantToSpend;
    } else {
      params.cryptoAmount = this.wantToBuy;
    }
    this.#checkFiatAmount(params);
    const res = await getProviderBuyCryptoPrice(params);
    this.#checkFiatAmount(res);
    return res;
  }
      
  set currency(value) {
    if (!value) return;
    this.components.currencySelect.value = value;
    this.#setCryptoCurrency(this.components.currencySelect.value);
    this.#updateBlockchains();
    this.#requestUpdate(true);
  }

  get currency() {
    const cval = this.components.currencySelect.value;
    if ((cval == null) || (cval == '')) return null;
    return cval;
  }

  set provider(value) {
    this.components.providerSelect.value = value;
  }

  get provider() {
    const cval = this.components.providerSelect.value;
    if ((cval == null) || (cval == '')) return null;
    return cval;
  }

  set blockchain(value) {
    this.components.blockchainSelect.value = value;
    this.#requestUpdate(true);
  }

  get blockchain() {
    const cval = this.components.blockchainSelect.value;
    if ((cval == null) || (cval == '')) return null;
    return cval;
  }

  set fiat(value) {
    this.components.fiatSelect.value = value;
    const fiat = this.#fiatCurrencies.find( f => f.symbol === value);
    if (fiat) {
      const pOptions = this.paymentType;
      const props = fiat.paymentOptions.find( po => po.id === pOptions);
      if (props) {
        this.components.wantToSpend.setAttribute('min', props.minAmount);
        this.components.wantToSpend.setAttribute('max', props.maxAmount);
      }
    }
    this.#updatePaymentTypes();
    this.#setFiatCurrency(this.components.fiatSelect.value);
    this.#requestUpdate(true);
  }

  get fiat() {
    const cval = this.components.fiatSelect.value;
    if ((cval == null) || (cval == '')) return null;
    return cval;
  }

  set wantToSpend(value) {
    const vn = +value;
    const tv = isNaN(vn) ? 0 : vn;
    this.components.wantToSpend.value = tv;    
    this.#requestUpdate(true);
  }

  get wantToSpend() {
    const vn = +this.components.wantToSpend.value
    return isNaN(vn) ? 0 : vn;
  }

  set wantToBuy(value) {
    const vn = +value;
    const tv = isNaN(vn) ? 0 : vn;
    this.components.wantToBuy.value = tv;    
    this.#requestUpdate(true);
  }

  get wantToBuy() {
    const vn = +this.components.wantToBuy.value
    return isNaN(vn) ? 0 : vn;
  }
    
  get fiatAmount() {
    return this.#fiatAmount;
  }

  set paymentType(value) {
    this.components.typeSelect.value = value;
    this.#requestUpdate(true);
  }

  get paymentType() {
    return this.components.typeSelect.value;
  }

  #selectFirstProvider() {
    const prov = getProviders();
    this.provider = prov[0].key;
  }

  async #selectFirstCurrency() {
    const cur = await getProviderCryptoCurrencies(this.provider);
    this.currency = cur[0].currency;
  }

  #selectFirstBlockchain() {
    if (this.currency == null) return;
    const bcs = getCurrencyBlockchains(this.currency);
    this.blockchain = bcs[0].key;
  }

  #selectFirstFiat() {
    if (this.provider == null) return;
    if (this.#country) {
      const localFiat = this.#fiatCurrencies?.find( c => c.defaultCountryForNFT === this.#country);
      if (localFiat) {
        this.fiat = localFiat.symbol;
        return;
      }
    }
    this.fiat = 'USD';
  }

  #getPaymentMethods() {
    if (this.provider == null) return;
    if (this.#fiatCurrencies == null) return;
    const cur = this.#fiatCurrencies.find(f => f.symbol == this.fiat);
    if (cur == null) throw new Error(`Can't find currency ${this.fiat}`);
    return cur.paymentOptions;
  }

  #updatePaymentTypes() {
    if (this.provider == null) return;
    if (this.#fiatCurrencies == null) return;
    if (this.fiat == null) return;
    this.components.typeSelect.innerText  = '';
    const paymentMethods = this.#getPaymentMethods();
    for (const method of paymentMethods) {
      const item = window.document.createElement("option");
      item.innerText = method.name == ' ' ? method.id : method.name;
      item.value = method.id;
      this.components.typeSelect.appendChild(item);
    }    
    if (this.fiat == null)
      this.#selectFirstFiat();
  }

  #fillProviders() {
    const providers = getProviders();
    for (const provider of providers) {
      const item = window.document.createElement("option");
      item.innerText = provider.name;
      item.value = provider.key;
      this.components.providerSelect.appendChild(item);
    }
    if (this.provider == null)
      this.#selectFirstProvider();
  }

  async #updateFiat() {
    const oldFiat = this.fiat;
    if (this.provider == null) return;
    this.#fiatCurrencies = await getProviderFiatCurrencies(this.provider);
    this.components.fiatSelect.innerText  = '';
    for (const fiat of this.#fiatCurrencies) {
      const item = window.document.createElement("option");
      item.innerText = fiat.symbol;
      item.value = fiat.symbol;
      this.components.fiatSelect.appendChild(item);
    }    
    this.fiat = oldFiat;
    if (this.fiat == null)
      this.#selectFirstFiat();
  }

  async #updateCurrencies() {
    const oldCurrency = this.currency;
    this.components.currencySelect.innerText = '';
    if (this.provider == null) return;    
    const currencies = await getProviderCryptoCurrencies(this.provider);
    for (const currency of currencies) {
      const item = window.document.createElement("option");
      item.innerText = currency.currency;
      item.value = currency.currency;
      this.components.currencySelect.appendChild(item);
    }        
    this.currency = oldCurrency;
    if (this.currency == null)
      await this.#selectFirstCurrency();
  }

  #updateBlockchains() {
    if (this.currency == null) return;
    const oldBlockchain = this.blockchain;
    const blockchains = getCurrencyBlockchains(this.currency);
    this.components.blockchainSelect.innerText  = '';
    for (const bc of blockchains) {
      const item = window.document.createElement("option");
      item.innerText = bc.name;
      item.value = bc.key;
      this.components.blockchainSelect.appendChild(item);
    }    
    this.blockchain = oldBlockchain;
    if (this.blockchain == null)
      this.#selectFirstBlockchain();
  }

  #gotoReview() {
    router.goto(`/buyReview.html?currency=${this.currency}&fiat=${this.fiat}&fiatAmount=${this.fiatAmount}&provider=${this.provider}&blockchain=${this.blockchain}&paymentType=${this.paymentType}`);
  }

  #getUrlParams() {
    const params = new URL(window.location);
    this.contact = params.searchParams.get('name') || null;
    this.currency = params.searchParams.get('currency') || null;
    this.amount = params.searchParams.get('amount') || null;
  }

  #setCryptoCurrency() {
    for (const elm of this.components.targetCrypto)
      elm.innerHTML = this.currency + ':';
  }

  #setFiatCurrency() {
    for (const elm of this.components.targetFiat)
      elm.innerHTML = this.fiat + ':';
  }

  #clearReports() {
    const blank = '--';
    this.components.conversionRate.innerHTML = blank;
    this.components.fiatAmount.innerHTML = blank;
    this.components.cryptoAmount.innerHTML = blank;
    this.components.totalFee.innerHTML = blank;        
    this.#fiatAmount = 0;
  }
  
  async #startTask() {
    taskManager.startExclusive(this.#buyTask);
  }

  #checkFiatAmount({ fiatAmount = null }) {
    if (!fiatAmount) return;
    let minValue = this.components.wantToSpend.getAttribute('min');
    if (fiatAmount < minValue) throw new Error(`Minimum fiat amount is ${minValue}`);
    let maxValue = this.components.wantToSpend.getAttribute('max');
    if (fiatAmount > maxValue) throw new Error(`Maximum fiat amount is ${maxValue}`);
    return true;
  }

  async #canBuy(buyTouched) {
    try {
      const details = await this.#getDetails(buyTouched);
      this.components.conversionRate.innerHTML = details.conversionPrice;
      this.components.fiatAmount.innerHTML = details.fiatAmount;
      this.components.cryptoAmount.innerHTML = details.cryptoAmount;
      this.components.totalFee.innerHTML = details.totalFee;
      this.components.wantToSpend.value = details.fiatAmount;
      this.components.wantToBuy.value = details.cryptoAmount;
      this.#fiatAmount = details.fiatAmount;      
      this.components.reviewBtn.disabled = false;
      this.#clearError();
    } catch(e) {
      console.error(e);
      this.#setError(e);
      this.#clearReports();
      this.components.reviewBtn.disabled = true;
    }
  }

  #buyTimeout = null;
  #requestUpdate(buyTouched) {
    clearTimeout(this.#buyTimeout);
    this.#buyTimeout = setTimeout(async () => {
      await this.#canBuy(buyTouched);
      this.#buyTimeout = null;
    }, 300);
  }

  #getErrorText(error) {
    return error.message;
  }

  #setError(error) {
    if (!this.#showError) return;
    this.classList.add('error');
    this.classList.add(error.code);
    const text = this.#getErrorText(error);
    this.components.error.innerHTML = text;
  }

  #clearError() {
    this.className = '';
  }

  set country(value) {
    if (!value) return;
    this.#country = value;
    const localFiat = this.#fiatCurrencies?.find( c => c.defaultCountryForNFT === value);
    if (localFiat) {
      this.fiat = localFiat.symbol;
      return;
    }
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    getLocale().then( locale => {
      if (!locale) return;
      this.country = locale?.country;
    });
    try {
      this.#user = users.getUser();
      if (this.#user == null)
        throw new Error('You are not authorized');

      this.components = {
        container: this.querySelector('.container'),
        backBtn: this.querySelector('.back-btn'),
        providerSelect: this.querySelector('#ProviderSelect'),
        typeSelect: this.querySelector('#TypeSelect'),
        fiatSelect: this.querySelector('#FiatSelect'),
        currencySelect: this.querySelector('#CurrencySelect'),
        blockchainSelect: this.querySelector('#BlockchainSelect'),
        wantToBuy: this.querySelector('#WantToBuy'),
        wantToSpend: this.querySelector('#WantToSpend'),
        targetCrypto: this.querySelectorAll('.target-crypto'),
        targetFiat: this.querySelectorAll('.target-fiat'),
        fiatAmount: this.querySelector('.fiat-amount'),
        cryptoAmount: this.querySelector('.crypto-amount'),
        totalFee: this.querySelector('.total-fee'),
        conversionRate: this.querySelector('.conversion-rate'),
        reviewBtn: this.querySelector('.review'),
        error: this.querySelector('.error-block'),
      };
      
      breadcrumbs.setTitle(localData.title.getText());
      await speechDispatcher.attachTask(this.#buyTask);      
      this.components.backBtn.onclick = () => {
        users.gotoHome();
      };
      this.#enableReviewBtn();
      
      setTimeout(async () => {
        try {
          this.#getUrlParams();
          this.#fillProviders();           
          await Promise.all([
            this.#updateCurrencies(), 
            this.#updateFiat()
          ]);
          this.#updateBlockchains();
          
          await this.#startTask();
          this.#selectFirstFiat();
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

    this.components.providerSelect.onchange = () => {
      this.#updateCurrencies();
    }

    this.components.currencySelect.onchange = () => {
      this.currency = this.components.currencySelect.value;
    }

    this.components.fiatSelect.onchange = () => {
      this.fiat = this.components.fiatSelect.value;
    }

    this.components.blockchainSelect.onchange = () => {
      this.blockchain = this.components.blockchainSelect.value;
    }

    this.components.typeSelect.onchange = () => {
      this.paymentType = this.components.typeSelect.value;     
    }

    this.components.wantToBuy.onkeydown = () => {
      this.#showError = true;
      this.operation = 'buy'; 
      this.#requestUpdate(true);
    };

    this.components.wantToSpend.onkeydown = () => {
      this.#showError = true;
      this.operation = 'spend';
      this.#requestUpdate(false);
    }

  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#buyTask);
    taskManager.end(this.#buyTask);
  }
}

async function buyActivity() {
  const activity = new Activity({
    name: 'buy',
    text: new local.LocalString({
      en: 'Buy Crypto',
      ru: 'Купить крипту',      
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/buy.html',
    top: ['activities', 'home'],
    order: 1,
    type: 'general',
    description: new local.LocalString({
      en:'Buy crypto from choosen provider',
      ru:'Покупайте крипту у выбранного провайдера'      
    })
  }, {
    check: async function () {
      const cr = await router.current();
      if (cr.name == 'buy') return false;
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
  buyActivity();
}

init()

customElements.define("speakease-buy", Buy);
