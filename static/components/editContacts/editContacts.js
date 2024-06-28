import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import taskManager from "/components/taskManager/taskManager.js";
import router from "/components/router/router.js";
const { Task } = taskManager;
import history from "/components/history/history.js";
import { LocalString } from "/components/local/local.js";
import { log } from "/intentions/console/console.js";
import clipboard from "../clipboard/clipboard.js";
import "/components/taskButton/taskButton.js";

import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import localContacts from "/components/localContacts/localContacts.js";
import koNLP from "../koNLP/koNLP.js";

const localData = {
  addOrDeleteContact: new LocalString({
    en: `
      <span>Do you want to add, delete or rename contact?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="add" task="editContacts" stage="addOrDeleteContact?" postfix="Add">Add</button>
        <button is="speakease-taskbutton" class="delete" task="editContacts" stage="addOrDeleteContact?" postfix="Delete">Delete</button>
        <button is="speakease-taskbutton" class="rename" task="editContacts" stage="addOrDeleteContact?" postfix="Rename">Rename</button>
      </div>
    `,
    ru: `
      <span>Хотите ли вы добавить, удалить или переименовать контакт?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="add" task="editContacts" stage="addOrDeleteContact?" postfix="Add">Добавить</button>
        <button is="speakease-taskbutton" class="delete" task="editContacts" stage="addOrDeleteContact?" postfix="Delete">Удалить</button>
        <button is="speakease-taskbutton" class="rename" task="editContacts" stage="addOrDeleteContact?" postfix="Rename">Переименовать</button>
      </div>
    `,
    ko: `
      <span>연락처를 추가, 삭제 또는 수정하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="add" task="editContacts" stage="addOrDeleteContact?" postfix="Add">추가</button>
        <button is="speakease-taskbutton" class="delete" task="editContacts" stage="addOrDeleteContact?" postfix="Delete">삭제</button>
        <button is="speakease-taskbutton" class="rename" task="editContacts" stage="addOrDeleteContact?" postfix="Rename">수정</button>
      </div>
    `
  }),
  addContactName: new LocalString({
    en: `To create a new contact, you can either speak the name or type it in.`,
    ru: `Для создания нового контакта вы можете как произнести имя, так и напечатать его`,
    ko: `추가하실 연락처의 이름을 말씀하시거나 입력해 주세요.`
  }),
  confirmFirstName: new LocalString({
    en: `
      <span>Do you want to set contact name as $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="addContactNameConfirm?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="addContactNameConfirm?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Хотите установить имя контакта $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="addContactNameConfirm?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="addContactNameConfirm?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>추가하실 연락처의 이름이 $1 맞습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="addContactNameConfirm?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="addContactNameConfirm?" postfix="No">아니요</button>
      </div>
    `,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', koNLP.addSubjectParticle(value)),
    }
  }),
  addContactWallet: new LocalString({
    en: `
      <span class="edit-contacts-public-key">Do you want to save the $1 address $2 for contact $3 ?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="addContactWalletConfirm?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="addContactWalletConfirm?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span class="edit-contacts-public-key">Хотите сохранить $1 адрес $2 для контакта $3 ?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="addContactWalletConfirm?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="addContactWalletConfirm?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span class="edit-contacts-public-key">$3에게 연락하기 위한 $1 연락처 $2 저장하시겠습니까 ?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="addContactWalletConfirm?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="addContactWalletConfirm?" postfix="No">아니요</button>
      </div>
    `,
    format: {
      en: (lText, entity) => {
        return lText
          .replace('$1', entity.type.data.en)
          .replace('$2', entity.value)
          .replace('$3', entity.name)
      },
      ru: (lText, entity) => {
        return lText
          .replace('$1', entity.data.ru)
          .replace('$2', entity.value)
          .replace('$3', entity.name)
      },
      ko: (lText, entity) => {
        return lText
          .replace('$1', entity.type.data.en)
          .replace('$2', koNLP.addObjectParticle(entity.value))
          .replace('$3', entity.name)
      }
    }
  }),
  createSuccess: new LocalString({
    en: `<div class="edit-contacts-created">
          <span>New $1 record was added for contact $2</span>
         </div>`,
    ru: `<div class="edit-contacts-created">
          <span>Новая запись $1 была добавлена для контакта $2</span>
        </div>`,
    ko: `<div class="edit-contacts-created">
          <span>$2에게 연락하기 위한 $1 추가되었습니다</span>
        </div>`,
    format: {
      en: (lText, entity) => {
        return lText
          .replace('$1', entity.type.data.en)
          .replace('$2', entity.name)
      },
      ru: (lText, entity) => {
        return lText
          .replace('$1', entity.data.ru)
          .replace('$2', entity.name)
      },
      ko: (lText, entity) => {
        return lText
          .replace('$1', koNLP.addSubjectParticle(entity.type.data.en))
          .replace('$2', entity.name)
      }
    }
  }),
  delContactName: new LocalString({
    en: `To delete an existing contact, you can either speak the name or type it in.`,
    ru: `Для удаления существующего контакта вы мы можете его произнести или напечатать`,
    ko: `저장된 연락처를 삭제하시려면 연락처 이름을 말씀하시거나 입력해 주세요.`
  }),
  confirmDelContactName: new LocalString({
    en: `
      <span>Are you certain that you wish to proceed with the deletion of the contact named $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="confirmDelContactName?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="confirmDelContactName?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Вы уверены, что хотите удалить имя контакта $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="confirmDelContactName?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="confirmDelContactName?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>$1 삭제하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="confirmDelContactName?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="confirmDelContactName?" postfix="No">아니요</button>
      </div>
      `,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', koNLP.addObjectParticle(value))
    }
  }),
  confirmDelContactNameError: new LocalString({
    en: `Please try again. In your contact list there is no contact`,
    ru: `Пожалуйста, попробуйте еще раз. В списке ваших контактов отсутствует контакт`,
    ko: `다시 시도해주십시오. 연락처에 해당하는 이름이 없습니다`,
    format: {
      en: (lText, value) => `${lText} - ${value}`,
      ru: (lText, value) => `${lText} - ${value}`,
      ko: (lText, value) => `${lText} - ${value}`
    }
  }),  
  publicKeyNotDetected: new LocalString({
    en: `Please copy public key address to clipboard`,
    ru: `Пожалуйста, скоприруйте публичный ключ в буфер обмена`,
    ko: `공개키 주소를 클립보드로 복사해 주세요`
  }),
  renameContactName: new LocalString({
    en: `To rename an existing contact, you can either speak the name or type it in.`,
    ru: `Для переименования существующего контакта вы мы можете его произнести или напечатать`,
    ko: `연락처 이름을 말씀하시거나 입력하여 기존의 연락처를 수정할 수 있습니다` //ToDo: need korean translation
  }),
  renameContactNewName: new LocalString({
    en: `Current contact name is $1. What new name do you want to assign, you can either speak the name or type it in?`,
    ru: `Текущее имя контакта %1. Какое новое имя вы хотели бы присвоить контакту, вы можете его произнести или напечатать?`,
    ko: `현재 연락처 이름은 $1입니다. 바꿀 연락처 이름을 말씀하시거나 입력해 주세요`,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', value)
    }
  }),
  confirmRenameContactName: new LocalString({
    en: `
      <span>Are you certain that you wish to proceed with the renaming of the contact named $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="confirmReNameContactName?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="confirmReNameContactName?" postfix="No">No</button>
      </div>
    `,
    ru: `
      <span>Вы уверены, что хотите переименовать имя контакта $1?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="confirmReNameContactName?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="confirmReNameContactName?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>$1 변경하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="editContacts" stage="confirmReNameContactName?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="editContacts" stage="confirmReNameContactName?" postfix="No">아니요</button>
      </div>
      `,
    format: {
      en: (lText, value) => lText.replace('$1', value),
      ru: (lText, value) => lText.replace('$1', value),
      ko: (lText, value) => lText.replace('$1', koNLP.addDirectionParticle(value))
    }
  }),
  title: new LocalString({
    en: `Manage contacts`,
    ru: `Manage contacts`,
    ko: `연락처 관리`,
  }),
}

function updateContact(entity) {
  const address = entity.value;
  const family = entity.type.data.family;
  const name = entity.name;
  localContacts.update(name, family, address);
}

function getEntity(entity) {
  if (entity.solanaPublic != null) return {
    type: new LocalString({
      blockchain: 'Solana',
      family: 'solana',
      en: 'Solana public',
      ru: 'публичный ключ Солана',
      ko: '솔라나 공개키',
    }),
    value: entity.solanaPublic
  };
  if (entity.bitcoinPublic != null) return {
    type: new LocalString({
      blockchain: 'bitcoin',
      family: 'bitcoin',
      en: 'Bitcoin public',
      ru: 'публичный ключ Биткоин',
      ko: '비트코인 공개키',
    }),
    value: entity.bitcoinPublic
  };
  if (entity.ethereumPublic != null) return {
    type: new LocalString({
      blockchain: 'ethereum',
      family: 'ethereum',
      en: 'Ethereum public',
      ru: 'публичный ключ Эфира',
      ko: '이더리움 공개키'
    }),
    value: entity.ethereumPublic
  };
  if (entity.stellarPublic != null) return {
    type: new LocalString({
      blockchain: 'stellar',
      family: 'stellar',
      en: 'Stellar public',
      ru: 'публичный ключ Стеллар',
      ko: 'Stellar public',
    }),
    value: entity.stellarPublic
  };
  if (entity.tronPublic != null) return {
    type: new LocalString({
      blockchain: 'Tron',
      family: 'tron',
      en: 'Tron public',
      ru: 'публичный ключ Tron',
      ko: 'Tron public',
    }),
    value: entity.tronPublic
  };
}

class EditContacts extends HTMLElement {
  #contactNameToDelete;
  #contactNameToRename;
  #contactNameToRenameNew;
  #entity;
  #type;
  #contact;
  #outerData = false;

  get type() { return this.#type; }
  get contact() { return this.#contact; }
  set type(value) { this.#type = value }
  set contact(value) { this.#contact = value }

  #saveContact() {
    const confirm = localData.createSuccess.format(this.#entity);
    log(confirm.data);
    updateContact(this.#entity);
  }

  async #checkExistance(name) {
    return await localContacts.check(name)
  }

  #contactTask = new Task({
    name: 'editContacts',
    text: {
      en: 'Edit Contact',
      ru: 'Редактировать контакты',
      ko: '연락처 편집'
    }
  }, {
    started: async (task) => {
      if (this.#type == null) {
        return task.setStage('addOrDeleteContact?');
      }
      if (this.#type == 'AddRequest') {
        return task.setStage('addContactName?');
      }
      if (this.#type == 'DeleteRequest') {
        this.#outerData = true;
        return task.setStage('delContactName?');
      }
      if (this.#type == 'RenameRequest') {
        this.#outerData = true;
        return task.setStage('reNameContactName?');
      
      }
      throw new Error(`Invalid request type ${this.#type}`);
    },
    'addOrDeleteContact?': () => {
      log(localData.addOrDeleteContact.data);
    },
    'addOrDeleteContact?-Add': (task) => {
      task.setStage('addContactName?');
    },
    'addOrDeleteContact?-Delete': (task) => {
      task.setStage('delContactName?');
    },
    'addOrDeleteContact?-Rename': (task) => {
      task.setStage('reNameContactName?');
    },
    'addContactName?': (task) => {
      if(this.#contact) {
        task.setStage('addContactWallet?');
      } else {
        log(localData.addContactName.data);
      }
    },
    'addContactName?-Text': (task, data) => {
      const text = data.text
      this.#contact = text;
      const confirm = localData.confirmFirstName.format(text);
      log(confirm.data);
      task.setStage('addContactNameConfirm?', null, false);
    },
    'addContactNameConfirm?-Yes': (task) => {
      task.setStage('addContactWallet?');
    },
    'addContactNameConfirm?-No': (task) => {
      this.#contact = null;
      task.setStage('addContactName?');
    },
    'addContactWallet?': async (task) => {
      const msg = await clipboard.detect({
        task, 
        allow: { bitcoinPublic: true, 
                ethereumPublic: true, 
                solanaPublic: true, 
                stellarPublic: true,
                tronPublic: true
        }, backBtn: 'addContactWallet?'});
      await log(msg.data);
    },
    'addContactWallet?-Back': async (task) => {
      this.#contact = null;
      task.setStage('addOrDeleteContact?');
    },
    'addContactWallet?-Clipboard-detected': (task, value) => {
      const ent = getEntity(value);
      this.#entity = { ...ent, name: this.#contact };
      const wallet = localData.addContactWallet.format(this.#entity);
      log(wallet.data);
      task.setStage('addContactWalletConfirm?', null, false);
    },
    'addContactWallet?-Clipboard-not-detected': async (task, entities) => {
      await log(entities);
    },
    'addContactWalletConfirm?-Yes': async (task) => {
      this.#saveContact();
      task.setStage('success');
    },
    'addContactWalletConfirm?-No': (task) => {
      task.setStage('addContactWallet?', null, false);
    },
    'delContactName?': () => {
      if(this.#contact) {
        const text = localData.confirmDelContactName.format(this.#contact);
        log(text.data);
      } else {
        log(localData.delContactName.data);
      }
    },
    'delContactName?-Text': (task, data) => {
      const text = data.text;
      this.#contactNameToDelete = this.#contact || text;
      task.setStage('confirmDelContactName?', null, false);
    },
    'confirmDelContactName?': () => {
      if(!this.#contact) {
        const contact = localData.confirmDelContactName.format(this.#contactNameToDelete);
        log(contact.data);
      }
    },
    'confirmDelContactName?-Yes': async (task) => {
      const contactExist = this.#contact ? true : await this.#checkExistance(this.#contactNameToDelete);
      if(contactExist) {
        await localContacts.remove(this.#contactNameToDelete);
        task.setStage('success');
      } else {
        task.setStage('confirmDelContactNameError?', null, false);
      }
    },
    'confirmDelContactName?-No': (task) => {
      !this.#outerData ? task.setStage('delContactName?', null, false) : router.goto('/contacts.html');
      
    },
    'reNameContactName?': (task) => {
      if(this.#contact) {
        this.#contactNameToRename = this.#contact;
        task.setStage('reNameContactNewName?', null, false);
      } else {
        log(localData.renameContactName.data);
      }
    },
    'reNameContactName?-Text': async (task, data) => {
      const text = data.text;
      this.#contactNameToRename = this.#contact || text;
      const contactExist = this.#contact ? true : await this.#checkExistance(this.#contactNameToRename);
      if(contactExist) {
        task.setStage('reNameContactNewName?', null, false);
      } else {
        task.setStage('confirmRenameContactNameError?', null, false);
      }
    },
    'reNameContactNewName?': () => {
      const text = localData.renameContactNewName.format(this.#contactNameToRename);
      log(text.data);
    },
    'reNameContactNewName?-Text': (task, data) => {
      const text = data.text;
      this.#contactNameToRenameNew = text;
      task.setStage('confirmReNameContactName?', null, false);
    },
    'confirmReNameContactName?': () => {
      const fromToNames = `${this.#contactNameToRename} - ${this.#contactNameToRenameNew}`;
      const text = localData.confirmRenameContactName.format(fromToNames);
      log(text.data);
    },
    'confirmReNameContactName?-Yes': async (task) => {
      await localContacts.rename(this.#contactNameToRename, this.#contactNameToRenameNew);
      task.setStage('success');
    },
    'confirmReNameContactName?-No': (task) => {
      !this.#outerData ? task.setStage('reNameContactName?', null, false) : router.goto('/contacts.html');
      
    },
    'confirmRenameContactNameError?': (task) => {
      const contact = localData.confirmDelContactNameError.format(this.#contactNameToRename);
      log(contact.data);
      task.setStage('reNameContactName?', null, false);
    },
    'confirmDelContactNameError?': (task) => {
      const contact = localData.confirmDelContactNameError.format(this.#contactNameToDelete);
      log(contact.data);
      task.setStage('delContactName?', null, false);
    },
    'success': () => {
      setTimeout(() => {
        router.goto({ name: 'contacts' });
      }, 3000)
    }
  });

  async #startTask() {
    taskManager.startExclusive(this.#contactTask);
  }

  connectedCallback() {
    setTimeout(() => {
      history.setUIEnabled(false, 'history');
      this.components = {};
      breadcrumbs.setTitle(localData.title.getText());
      speechDispatcher.attachTask(this.#contactTask);
      this.#startTask();
    }, 0);
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#contactTask);
    taskManager.end(this.#contactTask);
  }
}

customElements.define("speakease-editcontacts", EditContacts);
