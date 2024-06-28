import safe  from "/components/safe/safe.js";
import { addEntities } from "/intentions/entities/entities.js";

function createEntity(contact) {
  return {
    type: 'type',
    key: contact.id,
    name: {
      general: 'Contact',
      en: 'Contact',
      ru: 'Contact',
      ko: 'Contact'
    },
    value: contact.name,
    words: {
      en: contact.name
    }
  }
}

export function add(contacts) {
  if (safe.isEmpty(contacts)) return;
  const entities = contacts.map(createEntity);
  addEntities(entities);
}


export default {
  add
}
