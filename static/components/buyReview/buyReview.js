import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local from "/components/local/local.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import taskManager, { Task } from "/components/taskManager/taskManager.js";
import users from '/components/users/users.js';
import { getProvider, getBlockchain, getCurrency, getProviderBuyCryptoPrice, getProviderFiatCurrencies, buyCrypto } from "/components/blockchain/blockchain.js";
import router from  "/components/router/router.js";
import { LocalString } from "/components/local/local.js";

async function load() {
  return await local.loadHTML('/components/buyReview', 'buyReview.html');
}

const ready = load();

const localData = {
  title: new LocalString({
    en: 'Buy Review',
    ru: 'Данные о покупке',
    ko: '보내기 리뷰'
  }),
  'insufficient-funds': new LocalString({
    en: 'Insufficient funds for transaction',
    ru: 'Недостаточно средств для транзакции',
    ko: '트랜젝션을 위한 코인이 부족합니다'
  })
}

class BuyReview extends HTMLElement {
  #user;
  #provider = null;
  #currency = null;
  #fiat = null;
  #fiatAmount = null;  
  #date = null;
  #blockchain = null;
  #paymentType = null;

  #buyReviewTask = new Task({
      name: 'BuyReview',
      text: {
        en: 'BuyReview',
        ko: 'BuyReview'
      }
    }, {
      started:  (task) => {
        task.setStage('review');
      },
      'review': () => {
        this.#setStage('review');
        this.#fillDetails();
      },
      'review-Buy': (task) => {
        task.setStage('buy');
      },
      'buy': async (task) => {
        this.#setStage('wait');
        try {
          this.#clearError();
          const res = await this.#buy();
          console.log(res);
          task.setStage('success');
        } catch (e) {
          this.components.error.innerHTML = e.message;
          this.#setError(e);
          task.setStage('review');
        }
      },
      'success': (task) => {
        this.#setStage('success');
        setTimeout(() => {
          task.setStage('results');
        }, 3000)
      },
      'results': async () => {
        // save(value);
        /*this.#date = new Date();
        const ms = this.#date.getTime();
        const receiptPath = this.#getTransferLink({
          provider: this.#provider, 
          fiat: this.#fiat,
          amount: this.#fiatAmount,           
          currency: this.#currency, 
          date: ms          
        })*/
        users.gotoHome();
      }
    }
  );
  
  #clearError() {
    this.classList.remove('error')
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

  async #fillDetails() {
    const pt = await this.paymentType;
    const fv = await this.fiat;
    const params = { 
      provider: this.provider.key, 
      cryptoCurrency: this.currency.currency,
      fiatCurrency: fv.symbol,
      blockchain: this.blockchain.key,
      fiatAmount: this.fiatAmount,
      paymentOption: pt.id
    };    
    const res = await getProviderBuyCryptoPrice(params);
    this.#setCryptoCurrency();
    this.#setCryptoAmount(res.cryptoAmount);        
    this.components.conversionRate.innerHTML = res.conversionPrice;
    this.components.totalFee.innerHTML = res.totalFee;
  }

  async #buy() {
    const pt = await this.paymentType;
    const fv = await this.fiat;
    const params = { 
      provider: this.provider.key, 
      cryptoCurrency: this.currency.currency,
      fiatCurrency: fv.symbol,
      blockchain: this.blockchain.key,
      fiatAmount: this.fiatAmount,
      paymentOption: pt.id
    };
    const res = await buyCrypto(params);
    console.log(res);
    return res;
  }


  #updateCurrency() {
    if (this.components == null) return;
    const lname = this.currency.currency.toLowerCase();
    this.components.currencyImg.src = `/components/cryptoicons/${lname}.svg`;        
    this.#setCryptoCurrency();
  }

  #setCryptoCurrency() {
    for (const elm of this.components.targetCrypto)
      elm.innerHTML = this.currency.currency;
  }

  async #setFiatCurrency() {
    const fv = await this.fiat;
    for (const elm of this.components.targetFiat)
      elm.innerHTML = fv.symbol;
  }

  async #updateFiat() {    
    const fv = await this.fiat;
    if (fv.icon) {
      this.components.fiatImg.innerHTML = fv.icon;
    }
    this.#setFiatCurrency();    
  }

  #updateProvider() {
    if (this.components == null) return;
    this.components.providerName.innerHTML = this.provider.name;
  }

  async #updatePaymentType() {
    const pt = await this.paymentType;
    if (this.components == null) return;
    this.components.paymentType.innerHTML = pt.name == ' ' ? pt.id : pt.name;
  }

  async #getFiatCurrency(fiat) {
    const currencies = await getProviderFiatCurrencies(this.provider.key);
    const cur = currencies.find(c => c.symbol == fiat);
    if (cur == null) throw new Error(`Currency ${fiat} is not found`);
    return cur;
  }

  async #getPaymentType(paymentType) {
    const fv = await this.fiat; 
    const options = fv.paymentOptions;
    const opt = options.find(c => c.id == paymentType);
    if (opt == null) throw new Error(`Option ${paymentType} is not found`);
    return opt;
  }
    
  set fiat(value) {      
    this.#fiat = this.#getFiatCurrency(value)      
    this.#updateFiat();
  }

  get fiat() {
    return this.#fiat;
  }

  set currency(value) {        
    this.#currency = getCurrency(value);    
    this.#updateCurrency();
  }

  get currency() {
    return this.#currency;
  }

  set fiatAmount(value) {
    this.#fiatAmount = +value
    this.#setFiatAmount();
  }

  get fiatAmount() {
    return this.#fiatAmount;
  }
  
  set blockchain(value) {
    this.#blockchain = getBlockchain(value);
    this.components.blockchainName.innerHTML = this.#blockchain.name;
  }

  get blockchain() {
    return this.#blockchain;
  }

  set provider(value) {    
    this.#provider = getProvider(value);
    this.#updateProvider();
  }
  
  get provider() {
    return this.#provider;
  }

  set paymentType(value) {    
    this.#paymentType = this.#getPaymentType(value);
    this.#updatePaymentType();
  }

  get paymentType() {
    return this.#paymentType;
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
      this.#buyReviewTask.setStage('buy');
    }
  }

  #goBack() {
    router.goto({ name: 'buy' });
  }

  #getUrlParams() {
    const params = new URL(window.location);
    this.provider = params.searchParams.get('provider') || null;
    this.currency = params.searchParams.get('currency') || null;
    this.fiat = params.searchParams.get('fiat') || null;    
    this.fiatAmount = params.searchParams.get('fiatAmount') || null;
    this.blockchain = params.searchParams.get('blockchain') || null;
    this.paymentType = params.searchParams.get('paymentType') || null;
  }

  #getTransferLink({ 
    provider,
    fiat, 
    amount, 
    buyAmount,
    currency, 
    date, 
    transferId, 
    serviceFee, 
    networkFee 
  }) {
    const queries = [];
    if (fiat != null)
      queries.push(`fiat=${fiat}`);
    if (provider != null)
      queries.push(`provider=${provider}`);
    if (amount != null)
      queries.push(`amount=${amount}`);
    if (buyAmount != null)
      queries.push(`buyAmount=${buyAmount}`);
    if (currency != null)
      queries.push(`currency=${currency.value.currency}`);
    if (date != null)
      queries.push(`date=${date}`);
    if (transferId != null)
      queries.push(`transferId=${'12121213231'}`);
    if (serviceFee != null)
      queries.push(`servicefee=${serviceFee}`);
    if (networkFee != null)
      queries.push(`networkfee=${networkFee}`);
    return `/receiptBuy.html${queries.length > 0 ? `?${queries.join('&')}` : ''}`;
  }

  async #startTask() {
    taskManager.startExclusive(this.#buyReviewTask);
  }

  #setCryptoAmount(value) {
    for (const elm of this.components.cryptoAmount)
      elm.innerHTML = value;
  }

  #setFiatAmount() {
    for (const elm of this.components.fiatAmount)
      elm.innerHTML = this.#fiatAmount;
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    try {
      this.#user = users.getUser();
      if (this.#user == null)
        throw new Error('You are not authorized');

      this.components = {
        backBtn: this.querySelector('.back-btn'),
        approveBtn: this.querySelector('.approve'),
        currencyImg: this.querySelector('.currency-img'),
        fiatImg: this.querySelector('.fiat-img'),
        fiatName: this.querySelector('.fiat-name'),
        currencyName: this.querySelector('.blockchain-name'),
        blockchainName: this.querySelector('.family-name'),
        providerName: this.querySelector('.firm-name'),
        fiatAmount: this.querySelectorAll('.fiat-amount'),
        targetCrypto: this.querySelectorAll('.target-crypto'),
        targetFiat: this.querySelectorAll('.target-fiat'),
        cryptoAmount: this.querySelectorAll('.crypto-amount'),
        paymentType: this.querySelector('.payment-type'),
        totalFee: this.querySelector('.total-fee'),
        conversionRate: this.querySelector('.conversion-rate'),
        error: this.querySelector('.error')
      };

      breadcrumbs.setTitle(localData.title.getText());
      await speechDispatcher.attachTask(this.#buyReviewTask);      
      
      this.#enableStageBtns();
      this.components.backBtn.onclick = () => {
        this.#goBack();
      };

      setTimeout(async () => {
        this.#getUrlParams();
        await this.#startTask();
        router.updateRouteLinks();
      });          
    } catch (e) {
      console.error(e);
      this.#goBack();
    }

  }

  async disconnectedCallback() {
    taskManager.end(this.#buyReviewTask);
  }
}

customElements.define("speakease-buyreview", BuyReview);
