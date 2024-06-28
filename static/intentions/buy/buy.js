import { addEntities } from "/intentions/entities/entities.js";

const transferIntention = [{
  title: 'Buy transfer',
  input: 'BuyResult',
  output: 'BuyParameters'
}];


const gTransfer = [
  {
      type: 'task',
      name: {
        general: 'Buy transfer',
        en: 'Buy transfer',
        ru: 'Сделать покупку',
        ko: 'Buy transfer',
      },
      words: [
        { en: 'buy', ru: 'Сделать покупку', ko: 'buy'},
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
        general: 'Fiat',
        ru: 'Валюта',
        en: 'Fiat',
        ko: '주소',
        value: null
      }
    ],
    intentions: transferIntention,
    value: 'transfer'
  }  
];

addEntities(gTransfer);

export function getTransferLink({ fiat, amount, currency }) {
  const queries = [];
  if (fiat != null)
    queries.push(`fiat=${fiat}`);
  if (amount != null)
    queries.push(`amount=${amount}`);
  if (currency != null)
    queries.push(`currency=${currency}`);  
  return `/buy.html${queries.length > 0 ? `?${queries.join('&')}` : ''}`;
}

export default {
  getTransferLink
}