import { addEntities } from "/intentions/entities/entities.js";

const providers = [
  {
    type: 'type',
    name: {
      general: 'Provider',
      en: 'Provider',
      ru: 'Provider',
      ko: 'Provider'
    },
    value: {
      name: 'MoonPay'
    },
    words: [
      { en: 'moonpay', ru: 'мунпэй', ko: 'moonpay' },
      { en: 'moon play', ru: 'мун плэй' },
      { en: 'moon pie', ru: 'мун пай'},
      { en: 'moon bay'},
      { en: 'moon phase'},
      { en: 'mombai'},
      { en: 'one pay'},
    ]
  }, {
    type: 'type',
    name: {
      general: 'Provider',
      en: 'Provider',
      ru: 'Provider',
      ko: 'Provider'
    },
    value: {
      name: 'Transak'
    },
    words: [
      { en: 'transak', ru: 'транзак', ko: 'transak' },
      { en: 'transit', ru: 'транзит' },
      { en: 'transact' },
      { en: 'transaction' }
    ]
  }
];

addEntities(providers);

export function getProviders() {
  return providers;
}


export default {
      getProviders,
}