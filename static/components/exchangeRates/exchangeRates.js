import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local, { LocalString } from "/components/local/local.js";
import "/components/exchangeRates/components/exchangeRatesItem.js";
import config from "/config.js";
import "/components/preloader/preloader.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import system from '/components/system/system.js'
import entityServer from "/intentions/entityServer/entityServer.js";
import intentions from "/intentions/main.js";
import users from '/components/users/users.js';

async function remoteRates() {
  const response = await fetch(config.ratesProvider);
  const obj = await response.json();
  return obj;
}

async function loadRates() {
  return await remoteRates();
}

async function getRates() {
  const obj = await loadRates();
  //const rates = obj.rates;
  const rates = obj;
  const res = {};
  for (const key in rates) {
    const elem = rates[key];
    const type = elem.type ?? 'crypto';
    res[type] ??= {};
    res[type][key] = elem;
  }
  return res;
}

const currencyMap = {
  'klay': 'klay-token',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'usdt': 'tether',
  'eurt': 'tether-eurt',
};

async function getAvailableRates() {
  const cryptoRates = await getRates();
  const currency = {}
  for (const key in config.currencies) {
    const cur = config.currencies[key];
    const keyLc = cur.currency.toLowerCase()
    const tKey = currencyMap[keyLc] ?? keyLc;
    const pVal = cryptoRates.crypto[tKey];
    if (pVal == null) continue;
    currency[keyLc] = {
      usd: { value: pVal.usd, name: 'US Dollar' },
      unit: cur.currency.toLowerCase(),
      value: pVal.usd,
      changes: pVal.usd_24h_change.toFixed(2),
    }
  }
  cryptoRates.crypto = currency;
  return cryptoRates;
}


async function load() {
  return await local.loadHTML('/components/exchangeRates', 'exchangeRates.html');
}

const ready = load();

class ExchangeRates extends HTMLElement {

  #selectedCurrency = null;

  #entityHandler = (event) => {
    const entities = event.data;
    const nameER = intentions.getEntityByName(entities, 'Currency');
    if(nameER == null) return;
    this.currency = nameER.value.currency;
  }

  #selectCurrency() {
    if (this.components == null) return;
    const currencies = this.components.container.querySelectorAll("exchangerates-item");
    for (const item of currencies) {
      item.active = (item.key == this.#selectedCurrency);
      if(item.active) {
        item.scrollIntoView({block: "center", behavior: "smooth"});
      }
    }
  }

  #showContent(ratesItems) {
    const branch = ratesItems.crypto
    for (const key in branch) {
      const item = window.document.createElement("exchangerates-item");
      const elem = branch[key];
      item.shortName = elem.unit.toUpperCase();
      item.fullName = elem.name;
      item.price = elem.value;
      item.type = elem.type;
      item.target = elem.usd;
      item.key = key;
      item.icon = elem.unit;
      item.active = (key == this.#selectedCurrency);
      item.changes = elem.changes;
      this.components.container.appendChild(item);
    }
    this.components.container.classList.add('visible');
    this.components.loader.classList.remove('visible');
  }

  set currency(value) {
    this.#selectedCurrency = value?.toLowerCase() ?? null;
    this.#selectCurrency();
  }

  get currency() {
    return this.#selectedCurrency;
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    this.components = {
      container: this.querySelector('.container'),
      loader: this.querySelector('speakease-preloader'),
      backBtn: this.querySelector('.back-btn'),
    };
    breadcrumbs.setTitle(new LocalString({
      en: 'Exchange rates',
      ru: 'Exchange rates',
      ko: '코인 시세'
    }));
    entityServer.on.entity(this.#entityHandler);
    const exchangeRates = await getAvailableRates();
    await this.#showContent(exchangeRates);
    this.#selectCurrency();

    this.components.backBtn.onclick = () => {
      users.gotoHome();
    };
  }

  async disconnectedCallback() {
    entityServer.off.entity(this.#entityHandler);
  }
}

async function exchangeRatesActivity() {
  const activity = new Activity({
      name: 'exchangeRates',
      text: new local.LocalString({
        en: 'Check crypto price',
        ru: 'Обменные курсы сегодня',
        ko: '시세 확인',
        format: (text, name) => `${name}, ${text}`
      }),
      link: '/exchangeRates.html',
      top: ['activities', 'home'],
      exclude: ['exchangeRates'],
      order: 3,
      type: 'info',
      description: new local.LocalString({
        en:'To view actual cryptocurrency rates, say "cryptocurrency rates"',
        ru:'Для просмотра актуальных курсов крипотовалют произнесите - обменные курсы сегодня',
        ko:'코인 시세를 확인하시려면 다음과 같이 말씀해 주세요 - 시세 확인'
      })
    }, {
      check: async function () {
        if (!system.hasName()) return false;
        return true;
      }
  });
  activityManager.start(activity);
}

function init() {
  exchangeRatesActivity();
}

init();

customElements.define("speakease-exchangerates", ExchangeRates);
