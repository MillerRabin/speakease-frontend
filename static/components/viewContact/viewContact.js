import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import local, { LocalString } from "/components/local/local.js";
import "/components/exchangeRates/components/exchangeRatesItem.js";
import fs from "/components/fs/fs.js";
import "/components/viewContact/components/viewContactWalletItem/viewContactWalletItem.js";
import router from "/components/router/router.js";
import Wallets from "/components/wallets/wallets.js";

function getUrlParams () {
  const params = new URL(window.location);
  return params.searchParams.get('name');
}

async function load() {
  return await local.loadHTML('/components/viewContact', 'viewContact.html');
}

const ready = load();

class ViewContact extends HTMLElement {
  #name;

  set name(value) {
    this.#name = value;
    this.#updateName();
  }

  get name() {
    return this.#name;
  }


  #showContent(wallets) {
    for (const [key, value] of wallets) {
      const item = window.document.createElement("viewcontactwallet-item");
      const netObj = {};
      netObj[key] = value;
      item.net = Wallets.getFamilies(netObj);
      item.address = value;
      item.key = key;
      item.link = this.#name;
      this.components.container.appendChild(item);
    }
  }

  #updateName(name) {
    if (this.components == null) return;
    this.components.name.innerHTML = name;
  }

  #enableBackBtn() {
    this.components.backBtn.onclick = () => {
      router.goto('/contacts.html');
    }
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = await ready;
    this.components = {
      container: this.querySelector('.container'),
      name: this.querySelector('.name-info'),
      backBtn: this.querySelector('.back-btn'),
    };

    breadcrumbs.setTitle(new LocalString({
      en: 'View contact',
      ru: 'View contact',
      ko: '연락처 보기'
    }));
    this.#enableBackBtn();
    this.#name = getUrlParams();
    const contacts = JSON.parse(await fs.load('contacts'));
    this.#updateName(this.#name);
    this.#showContent(Object.entries(contacts[this.#name].addresses));
  }

  async disconnectedCallback() {
  }
}

customElements.define("speakease-viewcontact", ViewContact);
