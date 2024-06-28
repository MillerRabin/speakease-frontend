import { addEntities } from "/intentions/entities/entities.js";

const blockchains = [
  {
    type: 'type',
    name: {
      general: 'Blockchain',
      en: 'Blockchain',
      ru: 'Блокчейн',
      ko: '블록체인'
    },
    value: {
      family: 'ethereum',
      name: 'Klaytn'
    },
    words: [
      { en: 'klaytn', ru: 'Клейтон', ko: '클레이튼' }, { en: 'Clayton' }, { en: 'Clinton '}, { en: 'Klayton' },
    ]
  }, {
    type: 'type',
    name: {
      general: 'Blockchain',
      en: 'Blockchain',
      ru: 'Блокчейн',
      ko: '블록체인'
    },
    value: {
      family: 'solana',
      name: 'Solana'
    },
    words: [
      { en: 'solana', ru: 'солана', ko: '솔라나' }
    ]
  }, {
    type: 'type',
    name: {
      general: 'Blockchain',
      en: 'Blockchain',
      ru: 'Блокчейн',
      ko: '블록체인'
    },
    value: {
      family: 'bitcoin',
      name: 'Bitcoin'
    },
    words: [
      { en: 'bitcoin', ru: 'биткоин', ko: '비트코인' }
    ]
  }, {
    type: 'type',
    name: {
      general: 'Blockchain',
      en: 'Blockchain',
      ru: 'Блокчейн',
      ko: '블록체인'
    },
    value: {
      family: 'ethereum',
      name: 'Binance'
    },
    words: [
      { ru: 'бинанс', en: 'binance', ko: '바이낸스' },
      { en: 'violence' }
    ]
  }, {
    type: 'type',
    name: {
      general: 'Blockchain',
      en: 'Blockchain',
      ru: 'Блокчейн',
      ko: '블록체인'
    },
    value: {
      family: 'ethereum',
      name: 'Ethereum'
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
  }, {
    type: 'type',
    name: {
      general: 'Blockchain',
      en: 'Blockchain',
      ru: 'Блокчейн',
      ko: '블록체인'
    },
    value: {
      family: 'ethereum',
      name: 'Polygon'
    },
    words: [
      { ru: 'полигон', en: 'polygon' }    
    ]
  }, 
];

addEntities(blockchains);