import { addEntities } from "/intentions/entities/entities.js";

const fiats = [
  {
    type: 'type',
    name: {
      general: 'Fiat',
      en: 'Fiat',
      ru: 'Фиат',
      ko: 'Fiat'
    },
    value: {
      family: 'dollar',
      name: 'USD'
    },
    words: [
      { en: 'dollar', ru: 'Доллар', ko: 'dollar' }
    ]
  }, {
    type: 'type',
    name: {
      general: 'Fiat',
      en: 'Fiat',
      ru: 'Фиат',
      ko: 'Fiat'
    },
    value: {
      family: 'euro',
      name: 'EUR'
    },
    words: [
      { en: 'euro', ru: 'евро', ko: 'euro' },
      { en: 'ever', ru: 'евер', ko: 'ever' }
    ]
  }, {
    type: 'type',
    name: {
      general: 'Fiat',
      en: 'Fiat',
      ru: 'Фиат',
      ko: 'Fiat'
    },
    value: {
      family: 'ruble',
      name: 'RUB'
    },
    words: [
      { en: 'ruble', ru: 'рубль', ko: 'ruble' }
    ]
  }, 
  {
    type: 'type',
    name: {
      general: 'Fiat',
      en: 'Fiat',
      ru: 'Фиат',
      ko: 'Fiat'
    },
    value: {
      family: 'krw',
      name: 'KRW'
    },
    words: [
      { en: 'won', ru: 'вон', ko: 'won' },
      { en: 'korean won', ru: 'корейский вон', ko: 'korean won' }
    ]
  }, 
];

addEntities(fiats);

export function getFiats() {
  return fiats;
}


export default {
      getFiats,
}