import local, { LocalString } from "/components/local/local.js";
import loader from "/components/loader/loader.js";
import history from "/components/history/history.js";
import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import users from "/components/users/users.js";
import router from "/components/router/router.js";
import "/pages/walletBalance/components/walletBalanceItem.js";
import { currencies } from "/config.js";
import { getBalance, getUserKeys } from "/components/blockchain/blockchain.js";
import system from '/components/system/system.js'
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';

class WalletBalance {
  #user;

  #expandCurrencies() {
    const res = [];
    for (const cKey in currencies) {
      const cur = currencies[cKey];
      const userKeys = getUserKeys(cKey);
      for (const bkey in cur.blockchains) {
        const bc = cur.blockchains[bkey];
        const keys = userKeys[bc.family];
        res.push({ ...cur, ...bc, keys });
      }      
    }

    return res.sort((a, b) => {
      if (a.currency < b.currency) return -1;
      if (a.currency > b.currency) return 1;
      return 0;
    });
  }

  #showContent() {
    for (const bal of this.#expandCurrencies()) {
      const item = window.document.createElement("walletbalance-item");
      item.img = bal.img;
      item.value = () => {        
        return getBalance(bal, bal.keys.publicText);
      };
      item.name = bal.currency;
      item.net = bal.name;
      this.components.container.appendChild(item);
    }
  }

  constructor() {
    this.render = async (form) => {
      const lang = local.get();
      await loader.mountURL(form, `/pages/walletBalance/${lang.ui}/walletBalance.html`);
      this.components = {
        walletName: form.querySelector('.wallet-name'),
        container: form.querySelector('.container'),
      };
      try {
        this.#user = await users.getUser();
        if (this.#user == null)
          throw new Error('You are not authorized');
        const wl = await this.#user.wallet;
        this.components.walletName.innerHTML = wl.name;
        this.#showContent();
        breadcrumbs.setTitle(new LocalString({
          en: 'Wallet balance',
          ru: 'Wallet balance',
          ko: '지갑 잔고'
        }));
        history.setState('ui');
      } catch (e) {
        console.error(e);
        router.goto('/');
      }
    };
  }
}

async function balanceActivity() {
  const activity = new Activity({
      name: 'walletBalance',
      text: new local.LocalString({
        en: 'Show balance',
        ru: 'Покажи баланс',
        ko: '잔고 확인',
        format: (text, name) => `${name}, ${text}`
      }),
      link: '/walletBalance.html',
      top: ['home'],
      order: 1,
      type: 'info',
      description: new local.LocalString({
        en: 'SpeakEase: Your Voice-Activated Crypto Wallet.',
        ru: 'SpeakEase: Ваш голосовой криптокошелек',
        ko: 'SpeakEase: 당신의 음성 인식 전자 지갑',
      })
    }, {
      check: async function () {
        const user = users.getUser();
        if (user == null) return false;
        if (!system.hasName()) return false;
        return true;
      }
  });
  activityManager.start(activity);
}

balanceActivity();

const walletBalance = new WalletBalance();
export default walletBalance;
