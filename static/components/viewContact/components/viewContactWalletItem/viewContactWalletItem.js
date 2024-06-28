import { getTransferLink } from "/intentions/transfer/transfer.js";
import entityServer from "/intentions/entityServer/entityServer.js";
import intentions from "/intentions/main.js";
import { LocalString } from "/components/local/local.js";

const localData = {
  copied: new LocalString({
    en: 'Copied',
    ru: 'Copied',
    ko: '복사되었습니다'
  }),
  edit: new LocalString({
    en: 'Edit',
    ru: 'Edit',
    ko: '편집'
  }),
  walletAdress: new LocalString({
    en: 'Wallet<br>Address',
    ru: 'Wallet<br>Address',
    ko: '지갑<br>주소'
  }),
}


const template = `    
  <div class="wrapper">
    <div class="top-block">
      <div class="wallet-info">
        <div class="img-block">
          <img src="/components/viewContact/images/wallet-location_icon.png">
        </div>
        <div class="label">${localData.walletAdress.getText()}</div>
      </div>
      <div class="coin-info">
        <div class="coin-net"></div>
      </div>
    </div>
    <div class="info-block">
      <span class="tooltip">${localData.copied.getText()}!</span>
      <div class="address"></div>
      <div class="label-icon-block">
        <div class="label">${localData.edit.getText()}</div>
          <a class="edit-btn link route"></a>
      </div>
    </div>
  </div>
`;



class ViewContactWalletItem extends HTMLElement {
  #address;
  #net;
  #key;
  #link;

  #entityHandler = (event) => {
      const entities = event.data;
      const nameER = intentions.getEntityByName(entities, 'EditRequest');
      if(nameER == null) return;
      this.follow();
  }

  #updateAddress() {
    if (this.components == null) return;
    this.components.address.innerHTML = this.#address;
  }

  #updateNet() {
    if (this.components == null) return;
    this.components.net.innerHTML = this.#net;
  }

  #updateLink() {
    if (this.components == null) return;
    this.components.link.href = this.#link;
  }

  get link() {
    if (this.#link == null) return '';
    return this.#link;
  }

  set link(value) {
    this.#link = `/editContacts.html?name=${value}&type=AddRequest`;
    this.#updateLink();
  }



  constructor() {
    super();
    const render = async (form) => {
      form._template = template
    };
    this.ready = render(this);
  }

  set address(value) {
    this.#address = value;
    this.#updateAddress();
  }

  get address() {
    return this.#address;
  }

  set net(value) {
    this.#net = value;
    this.#updateNet();
  }

  get net() {
    return this.#net;
  }

  set key(value) {
    this.#key = value;
  }

  get key() { return this.#key;}

  follow() {
    this.components.link.click();
  }

  async connectedCallback() {
    await this.ready;
    this.innerHTML = this._template;
    this.components = {
      address: this.querySelector('.address'),
      name: this.querySelector('.coin-name'),
      net: this.querySelector('.coin-net'),
      tooltip: this.querySelector('.tooltip'),
      labelIconBlock: this.querySelector('.label-icon-block'),
      link: this.querySelector('.link'),
    }

    this.#updateAddress();
    this.#updateNet();
    this.#updateLink();

    this.components.address.onclick = async () => {
      await navigator.clipboard.writeText(this.#address);
      this.components.tooltip.classList.add('visible');
      setTimeout(() => {
        this.components.tooltip.classList.remove('visible');
      }, 2000);
    }
    this.components.labelIconBlock.onclick = () => {
      this.follow();
    }
    entityServer.on.entity(this.#entityHandler);
  }
  async disconnectedCallback() {
    entityServer.off.entity(this.#entityHandler);
  }
}

customElements.define("viewcontactwallet-item", ViewContactWalletItem);
