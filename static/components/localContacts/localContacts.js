import fs from "/components/fs/fs.js";
import system from '/components/system/system.js'
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import { LocalString } from '../local/local.js';
import contactsInt from "/intentions/contacts/contacts.js";
import users from "/components/users/users.js";
import blockchain from "/components/blockchain/blockchain.js"

let gContacts = null;
const contactFile = 'contacts';

export function update(name, type, value) {
  const contact = getContact(name);
  if (contact.addresses == null)
    contact.addresses = {};
  contact.addresses[type] = value;
  const str = JSON.stringify(gContacts);
  fs.save(contactFile, str);
  addIntentionContactTypes();
}

function iGet() {
  try {
    const sContacts = fs.load(contactFile);
    if (sContacts == null) return {};
    return JSON.parse(sContacts) || {};
  } catch (e) {
    return {};
  }
}

export function get() {
  if ((gContacts != null) && (Object.values(gContacts).length > 0)) return gContacts;
  gContacts = iGet();
  return gContacts;
}

export function getContactByAddress(address) {
  const lAddress = address?.toLowerCase();
  const contacts = gContacts != null ? gContacts : iGet();
  for (const contact in contacts) {
    const address = Object.values(contacts[contact].addresses);
    const fnd = address.find(a => a.toLowerCase() == lAddress);
    if (fnd != null) return contact;
  }
  return null;
}

function createContact(name) {
  return {
    name,
    addresses: {}
  }
}

function getContact(name) {
  const cnts = get();
  if (cnts[name] == null)
    cnts[name] = createContact(name);
  return cnts[name];
}

export function has(name, type) {
  const cnts = get();
  if (cnts[name] == null) return false;
  if (type == null) return true;
  const cn = cnts[name];
  return cn.addresses[type] == null;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getAddress(contact, type) {
  const tn = contact.addresses[type]
  if (tn != null) return tn;
  const legacyKey =  capitalizeFirstLetter(`${type} family`);
  const ltn = contact.addresses[legacyKey];
  if (ltn != null) return ltn;
  const err = new Error(`record with type ${type} is not found for contact ${contact.name}`);
  err.code = 'contact-not-found';
  throw err;
}

export function findContact(name, type) {
  const cnts = get();
  const cn = cnts[name];
  if (cn == null) throw new Error('contact is not found');
  if (type == null) return cnts[name];
  return getAddress(cn, type);
}

export async function check(name) {
  const contacts = await get();
  return (contacts[name] != null) ? true : false
}

export async function remove(name) {
  const contacts = await get();
  delete contacts[name];
  fs.save('contacts', JSON.stringify(contacts))
}

export async function rename(oldName, newName) {
  const contacts = await get();
  if(!contacts[oldName] || oldName === newName) return;
  const newContact = structuredClone(contacts[oldName]);
  newContact.name = newName; 
  contacts[newName] = newContact;
  delete contacts[oldName];
  fs.save('contacts', JSON.stringify(contacts));
}


const contactEditActivityName = 'editContacts';
const contactFindActivityName = 'contacts';

function createFindActivity() {
  const activity = new Activity({
    name: contactFindActivityName,
    text: new LocalString({
      en: `Show contacts`,
      ru: `Покажи контакты`,
      ko: `연락처 보기`,
      format: (text, name) => `${name}, ${text}`
    }),
    top: ['home'],
    link: '/contacts.html',
    order: 4,
    type: 'info',
    description: new LocalString({
      en:'Check your contacts',
      ru:'Проверьте ваши контакты',
      ko:'연락처 확인'
    })
  }, {
    check: function () {
      if (!system.hasName()) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
  return activity;
}

function createEditActivity() {
  const activity = new Activity({
    name: contactEditActivityName,
    text: new LocalString({
      en: `Manage Contacts`,
      ru: `Редактирование контакта`,
      ko: `연락처 관리`,
      format: (text, name) => `${name}, ${text}`
    }),
    top: ['home'],
    link: '/editContacts.html',
    order: 12,
    type: 'general',
    description: new LocalString({
      en:'To add, remove or edit contact, say manage contacts',
      ru:'Для добавления, удаления или редактирования контакта произнесите - редактировать контакт',
      ko:'연락처를 추가, 제거 또는 편집을 하시려면 다음과 같이 말씀하십시오 - 연락처 편집',
    })
  }, {
    check: function () {
      if (!system.hasName()) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
  return activity;
}


async function addIntentionContactTypes() {
  const contactList = get();
  if (contactList == null) return;
  const contacts = Object.values(contactList)
  contactsInt.add(contacts);
}

export function resolveAddress(address) {
  if (!address) return null;
  const keys = blockchain.getUserWalletKeys();
  for (const key of Object.values(keys)) {
    const mp = key.publicText.toLowerCase();
    const lAddr = address.toLowerCase();
    const user = users.getUser();
    if (mp == lAddr) return user.wallet.name;
    const contact = getContactByAddress(address);
    if (contact != null) return contact;
  }
  return address;
}

async function init() {
  setTimeout(() => {
    addIntentionContactTypes();
    createFindActivity();
    createEditActivity();
  }, 0);
}

init();

export default {
  has,
  findContact,
  update,
  get,
  remove,
  check,
  getContactByAddress,
  rename,
  resolveAddress
}
