import { addEntities } from "/intentions/entities/entities.js";

const currencies = [
{
  type: 'type',
  name: {
    general: 'Currency',
    en: 'Currency',
    ru: 'Currency',
    ko: 'Currency'
  },
  value: {
    currency: 'KLAY',
    blockchain: 'Klaytn',
    family: 'ethereum'
  },
  words: [
    { ru: 'клей', en: 'clay', ko: '클레이' },
    { en: 'klay' }, 
    { en: 'gray' }
  ]
}, {
  type: 'type',
  name: {
    general: 'Currency',
    en: 'Currency',
    ru: 'Currency',
    ko: 'Currency'
  },
  value: {
    currency: 'SOL',
    blockchain: 'Solana',
    family: 'solana'
  },
  words: [
    { ru: 'солана', en: 'solana', ko: '솔라나' },
    { en: 'Savannah' }
  ]
},
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'SIDO',
      blockchain: null,
      family: 'ethereum'
    },
    words: [{ ru: 'сидо', en: 'cida', ko: '시도' }, { en: 'cedar' }, { en: 'she do' }, { en: 'shugar' }, { en: 'cheetah' }]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'BTC',
      blockchain: 'Bitcoin',
      family: 'bitcoin'
    },
    words: [{ ru: 'биткоин', en: 'bitcoin', ko: '비트코인' }]
  }, {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'ETH',
      blockchain: 'Ethereum',
      family: 'ethereum'
    },
    words: [
      { ru: 'эфириум', en: 'ethereum', ko: '이더리움' },
      { en: 'ever'},
      { en: 'atrium'},
      { en: 'at the room'},
      { en: 'bedroom'},
      { en: 'the federal'},
      { en: 'potato'},
      { en: 'perfume' },
      { en: 'answer' }
    ]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'LTC',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'лайт коин', en: 'litecoin', ko: '라이트코인' }]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'BNB',
      blockchain: 'Binance',
      family: 'ethereum'
    },
    words: [
      { ru: 'бинанс', en: 'binance', ko: '바이낸스' },
      { en: 'violence' }
    ]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'BCH',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'биткоин кеш', en: 'bitcoin cash', ko: '비트코인 캐시'}, {ru: 'бисиэйч', en: 'bch'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'EOS',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'эос', en: 'eos', ko: '이오스'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'XRP',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'иксарп', en: 'xrp', ko: '리플'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'XLM',
      blockchain: 'stellar',
      family: 'stellar',
    },
    words: [{ ru: 'икслм', en: 'xlm', ko: '스텔라루멘'}, {ru: 'люменс', en: 'lumens'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'LINK',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'чейнлинк', en: 'chainlink', ko: '체인링크'}, {ru: 'линк', en: 'link', ko: '링크'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'DOT',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'полькадот', en: 'polkadot', ko: '폴카닷'}, {ru: 'дот', en: 'dot', ko: '닷'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'YFI',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'ерн', en: 'yearn', ko: '연'}, {ru: 'уайфиай', en: 'yfi', ko: '연 파이낸스'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'μBTC',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'битс', en: 'bits', ko: '마이크로 비트코인'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'sats',
      blockchain: null,
      family: null,
    },
    words: [{ ru: 'сатс', en: 'sats'}, {ru: 'сатоши', en: 'satoshi', ko: '사토시'}]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'USDT',
    },
    words: [{ ru: 'юэсдт', en: 'usdt' }]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'EURT',
    },
    words: [
      { ru: 'евро ти', en: 'eurt' },
      { en: 'euro g' },
      { en: 'eurogir' },
      { en: 'euro tier' },
      { en: 'euro care' },
    ]
  },
  {
    type: 'type',
    name: {
      general: 'Currency',
      en: 'Currency',
      ru: 'Currency',
      ko: 'Currency'
    },
    value: {
      currency: 'MATIC',
      blockchain: 'polygon',
      family: 'ethereum'
    },
    words: [{ ru: 'матик', en: 'matic' }]
  }  
];

addEntities(currencies);

export function getCurrencies() {
  return currencies.filter(c => c.name.general == 'Currency');
}

export function getAvailableCurrencies() {
  return currencies.filter(c => c.name.general == 'Currency' && (c.value.blockchain != null));  
}

export function getCurrency(currency) {
  const lCurr = currency.toLowerCase();
  const cr = currencies.find(c => c.value.currency.toLowerCase() == lCurr);
  if (cr == null) throw new Error(`Currency ${currency} is not found`);
  return cr;
}

export default {
  getCurrency,
  getCurrencies,
  getAvailableCurrencies
}
