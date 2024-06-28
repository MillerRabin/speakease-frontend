import { getTransferLink } from "/intentions/transfer/transfer.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import { LocalString } from "/components/local/local.js";

const localData = {
  send: new LocalString({
    en: 'Send',
    ru: 'Send',
    ko: '보내기'
  }),
  view: new LocalString({
    en: 'View',
    ru: 'View',
    ko: '보기'
  }),
  rename: new LocalString({
    en: 'Rename',
    ru: 'Rename',
    ko: '이름 변경'
  }),
  remove: new LocalString({
    en: 'Remove',
    ru: 'Remove',
    ko: '삭제'
  }),
}

const template = `    
  <div class="contact-block">
    <button class="btn-name contact"></button>
    <div class="panel">
      <div class="info-block"></div>
      <div class="action-block">
        <a class="send route">${localData.send.getText()}</a>
        <a class="view-btn route">${localData.view.getText()}</a>
        <a class="rename-btn route">${localData.rename.getText()}</a>
        <a class="del-btn route">${localData.remove.getText()}</a>
      </div>
    </div>
  </div>
`;


function toggleFilterBlockHandler(contactBlock) {
  contactBlock.classList.toggle("open");
}

function enableFilterBlocks(form) {
  const contactBlock = form.components.contactBlock;
  const toggleButton = contactBlock.querySelector(".contact");
  toggleButton.onclick = () => toggleFilterBlockHandler(contactBlock);
}

class ContactsItem extends HTMLElement {
  #info;
  #name;
  #key;
  #link;
  #sendLink;

  #updateInfo() {
    if (this.components == null) return;
    this.components.info.innerHTML = this.#info;
  }

  #updateName() {
    if (this.components == null) return;
    this.setAttribute('data-name', this.#name);
    this.components.name.innerHTML = this.#name;
  }

  #updateLink() {
    if (this.components == null) return;
    this.components.link.href = this.#link;
    this.components.send.href = this.#sendLink;
    this.components.renameBtn.href = `/editContacts.html?type=RenameRequest&name=${this.name}`;
    this.components.delBtn.href = `/editContacts.html?type=DeleteRequest&name=${this.name}`;
  }

  get link() {
    if (this.#link == null) return '';
    return this.#link;
  }

  set link(value) {
    this.#link = `/viewContact.html?name=${value}`;
    this.#sendLink = `/transfer.html?name=${value}`;
    this.#updateLink();
  }

  set info(value) {
    this.#info = value;
    this.#updateInfo();
  }

  get info() { return this.#info; }
  set name(value) {
    this.#name = value;
    this.#updateName();
  }

  get name() { return this.#name; }
  set key(value) { this.#key = value; }
  get key() { return this.#key; }

  open() {
    this.components.contactBlock.classList.add("open");
  }

  close() {
    this.components.contactBlock.classList.remove("open");
  }

  follow() {
    this.components.link.click();
  }

  async connectedCallback() {
    this.innerHTML = template;
    this.components = {
      info: this.querySelector('.info-block'),
      name: this.querySelector('.btn-name'),
      contactBlock: this.querySelector('.contact-block'),
      link: this.querySelector('.view-btn'),
      send: this.querySelector('.send'),
      viewBtn: this.querySelector('.view-btn'),
      renameBtn: this.querySelector('.rename-btn'),
      delBtn: this.querySelector('.del-btn'),
    }
    this.#updateInfo();
    this.#updateName();
    this.#updateLink();
    enableFilterBlocks(this);

    this.components.viewBtn.onclick = () => {
      this.follow();
    }
  }
  async disconnectedCallback() {
  }
}

customElements.define("contacts-item", ContactsItem);
