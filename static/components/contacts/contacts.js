import local, { LocalString } from "/components/local/local.js";
import history from "/components/history/history.js";
import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import "/components/contacts/components/contactsItem/contactsItem.js";
import router from "/components/router/router.js";
import localContacts from "/components/localContacts/localContacts.js";
import intentions from "/intentions/main.js";
import wallets from "/components/wallets/wallets.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";

async function load() {
  return await local.loadHTML('/components/contacts', 'contacts.html');
}

const ready = load();

class Contacts extends HTMLElement {
  #currentName;
  #contactTask = new Task({
    name: 'Edit contact',
    text: {
      en: 'Edit contact',
      ru: 'Редактирование контакта',
      ko: '연락처 편집'
    }
  }, {
    started: async (task) => {
      task.setStage('contact?', null, false);
    },
    'contact?-Contact': (_, contact) => {
      if (contact == null) return;
      this.#currentName = contact.value;
      this.#open(this.#currentName);
    },
    'contact?-Rename': () => {
      if(this.#currentName) {
        const contact = this.#findContact(this.#currentName);
        contact.components.renameBtn.click();
      }
    },
    'contact?-Delete': () => {
      if(this.#currentName) {
        const contact = this.#findContact(this.#currentName);
        contact.components.delBtn.click();
      }
    },
    'contact?-View': () => {
      this.#follow(this.#currentName);
    },
    'contact?-Send': () => {
      if(this.#currentName) {
        const contact = this.#findContact(this.#currentName);
        contact.components.send.click();
      }
    }
  }
);


  async #showContent(items) {
    const contacts = Object.values(items);
    contacts.sort((a,b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    for (const contact of contacts) {
      const item = window.document.createElement("contacts-item");
      item.info = wallets.getFamilies(contact.addresses);
      item.name = contact.name;
      item.key = contact.name;
      item.link = contact.name;
      item.setAttribute('contact', contact.name);
      
      item.onclick = async () => {
        this.#currentName = item.getAttribute('contact');
        this.#open(this.#currentName);
      }
      this.components.container.appendChild(item);
    }
    router.updateRouteLinks();
  }

  #dispatchContact(entities) {
    const contact = intentions.getEntityByName(entities, 'Contact');
    if (contact == null) return;
    this.#open(contact.value);
  }

  #findContact(name) {
    return this.components.container.querySelector(`contacts-item[data-name="${name}"]`);
  }

  #oldContact;
  #open(name) {
    const contact = this.#findContact(name);
    if (contact == null) return;
    this.#oldContact?.close();
    contact.open();
    this.#currentName = name;
    this.#oldContact = contact;
  }

  #follow(name) {
    if (name == null) return false;
    const contact = this.#findContact(name);
    if (contact == null) return false;
    contact.follow(contact);
  }

  async #startTask() {
    taskManager.startExclusive(this.#contactTask);
  }


  async connectedCallback() {
    this.innerHTML = await ready;
    this.components = {
      container: this.querySelector('.container'),
      backBtn: this.querySelector('.back-btn')
    };
    breadcrumbs.setTitle(new LocalString({
      en: 'Contacts',
      ru: 'Contacts',//Please translate into Russian
      ko: '연락처'
    }));
    history.setState('ui');
    this.components.backBtn.onclick = () => {
      window.history.go(-1);
    };
    const contacts = localContacts.get();
    this.#showContent(contacts);
    await speechDispatcher.attachTask(this.#contactTask);
    await this.#startTask();
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#contactTask);
    taskManager.end(this.#contactTask);
  }
}

customElements.define("speakease-contacts", Contacts);
