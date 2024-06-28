import { addEntities } from "/intentions/entities/entities.js";

const transferIntention = [{
  title: 'Make transfer',
  input: 'TransferResult',
  output: 'TransferParameters'
}];


const gTransfer = [
  {
      type: 'task',
      name: {
        general: 'Make transfer',
        en: 'Make transfer',
        ru: 'Сделать перевод',
        ko: '보내기'
      },
      words: [
        { en: 'make transfer', ru: 'Сделать перевод', ko: '송금 실행'},
        { en: 'send', ru: 'Отправить', ko: '보내기' },
        { en: 'sent' }
      ],
      parameters: [
        { general: 'Name', value: null },
        {
          general: 'Currency',
          ru: 'Валюта?',
          en: 'Currency?',
          ko: '화폐',
          value: null
        }, {
          general: 'Amount',
          ru: 'Сумма',
          en: 'Sum?',
          ko: '총합?',
          value: null
      }, {
        general: 'Contact',
        ru: 'Контакт',
        en: 'Contact',
        ko: '연락처',
        value: null
      }
    ],
    intentions: transferIntention,
    value: 'transfer'
  }  
];

addEntities(gTransfer);

export function getTransferLink({ name, amount, currency }) {
  const queries = [];
  if (name != null)
    queries.push(`name=${name}`);
  if (amount != null)
    queries.push(`amount=${amount}`);
  if (currency != null)
    queries.push(`currency=${currency}`);  
  return `/transfer.html${queries.length > 0 ? `?${queries.join('&')}` : ''}`;
}

export default {
  getTransferLink
}