import fs from "/components/fs/fs.js";
import blockchain, { getCurrencyEndpoint } from "../blockchain.js";

const historyFile = 'history';

function iGet() {
  try {
    const sHistory = fs.load(historyFile);
    if (sHistory == null) return [];
    return JSON.parse(sHistory) || [];
  } catch (e) {
    return [];
  }
}

function getCurrency(currency) {
  try {
    return blockchain.getCurrency(currency);
  } catch {
    return  {
      currency
    }
  }
}

export function get() {
  const hs = iGet();
  const res = [];
  for (const h of hs) {
    const { currency } = h;
    if (!currency) continue;
    try {
      let curFamily = getCurrency(currency);
      const bcKeys = Object.keys(curFamily.blockchains);
      for (const bc of bcKeys) {
        const endpoint = getCurrencyEndpoint(currency, bc); 
        if (endpoint.name !== h.blockchain) continue;
        h.amount = blockchain.format({ amount: h.amount, currency, blockchain: bc });
        res.push({
          blockchain: endpoint.name,
          output: h,
          date: new Date(h.date),
          module: 'local'
        });
      }
    } catch(err) {
      continue;
    }
  }
  return res;
}

function createRecord(data) {
  return {    
    ...data,
    date: new Date().getTime(),    
  }
}

export async function save(data) {
  const record = createRecord(data);
  const history = get();
  history.push(record)
  fs.save(historyFile, JSON.stringify(history));
}

export default {  
  get,
  save  
}
