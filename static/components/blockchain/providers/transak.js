import { getCurrency, getCurrencyEndpoint } from '../blockchain.js';
import { providers, isTest } from '/config.js';

function getUrl() {
  return isTest ? 'https://api-stg.transak.com' : 'https://api.transak.com';
}

async function requestCryptoCurrencies() {
  const options = { method: 'GET', headers: { accept: 'application/json' } };
  const res = await fetch(`${getUrl()}/api/v2/currencies/crypto-currencies`, options);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  const jresp = JSON.parse(text);
  return jresp.response;  
}

async function requestFiatCurrencies() {
  const options = { method: 'GET', headers: { accept: 'application/json' } };
  const res = await fetch(`${getUrl()}/api/v2/currencies/fiat-currencies?apiKey=${providers.transak.transakPartnerApiKey}`, options);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  const jresp = JSON.parse(text);
  return jresp.response;  
}

export async function getCryptoCurrencies() {
  const targetCurrencies = await requestCryptoCurrencies();
  const supportedCurrencies = {};  
  for (const curr of targetCurrencies) {
    const symbol = curr.symbol;
    const sCurr = getCurrency(symbol, false);
    if (sCurr == null) continue;
    if (supportedCurrencies[sCurr.currency] == null) 
      supportedCurrencies[sCurr.currency] = { ...sCurr, blockchains: {} };
    const targetNetwork = curr.network;
    const networkName = targetNetwork.name;
    const bc = getCurrencyEndpoint(symbol, networkName, false);
    if (bc == null) continue;
    const sourceBlockchain = sCurr.blockchains[bc.key];
    if (sourceBlockchain == null) continue;
    supportedCurrencies[sCurr.currency].blockchains[bc.key] = sourceBlockchain;
  }
  const vs = Object.values(supportedCurrencies)
  return vs.filter(r => Object.keys(r.blockchains).length > 0);  
}

export async function getFiatCurrencies() {
  const cur = await requestFiatCurrencies();
  return cur.sort((a, b) => {
    if (a.symbol < b.symbol) return -1;
    if (a.symbol > b.symbol) return 1;
    return 0;
  });
}

const bcNetworkMap = {
  bitcoin: 'mainnet',
  binance: 'bsc',
}

export async function getBuyCryptoPrice({ cryptoCurrency, cryptoAmount = 0, fiatCurrency, fiatAmount = 0, blockchain, paymentOption }) {  
  if (cryptoCurrency == null) throw new Error('cryptoCurrency is expected');
  if (paymentOption == null) throw new Error('paymentOption is expected');
  if (fiatCurrency == null) throw new Error('fiatCurrency is expected');
  if (blockchain == null) throw new Error('blockchain is expected');
  if (isNaN(cryptoAmount)) throw new Error('Crypto amount must be a number');
  if (isNaN(fiatAmount)) throw new Error('Fiat amount must be a number');  
  const options = { method: 'GET', headers: { accept: 'application/json' } };
  const params = [ 
    `partnerApiKey=${providers.transak.transakPartnerApiKey}`,
    `fiatCurrency=${fiatCurrency}`,
    `cryptoCurrency=${cryptoCurrency}`, 
    `isBuyOrSell=BUY`,
    `network=${bcNetworkMap[blockchain] ?? blockchain}`,
    `paymentMethod=${paymentOption}`
  ];
    
  if ((fiatAmount == 0) && (cryptoAmount == 0))
    throw new Error('fiatAmount or cryptoAmount is required');
  
  if (fiatAmount > 0)
    params.push(`fiatAmount=${fiatAmount}`);
  if (cryptoAmount > 0)
    params.push(`cryptoAmount=${cryptoAmount}`);  
  
  const res = await fetch(`${getUrl()}/api/v2/currencies/price?${params.join('&')}`, options);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  const jresp = JSON.parse(text);
  return jresp.response;  
}

export function buyCrypto({ cryptoCurrency, fiatCurrency, walletAddress, fiatAmount = 0, blockchain, paymentOption }) {  
  return new Promise((resolve, reject) => {
    const transak = new window.TransakSDK.default({
      apiKey: providers.transak.transakPartnerApiKey,
      environment: providers.transak.environment,
      network: blockchain,
      paymentMethod: paymentOption,      
      fiatAmount,
      fiatCurrency,
      cryptoCurrencyCode: cryptoCurrency,
      walletAddress
    });
  
    transak.init();
      
    transak.on(transak.ALL_EVENTS, (data) => {
      console.log(data);
    });
      
    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, (data) => {
      reject(new Error(data.eventName));
      transak.close();
    });
  
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      console.log(orderData);
      resolve(orderData);
      transak.close();
    });  
  });  
}


export default {
  getCryptoCurrencies,
  getFiatCurrencies,
  getBuyCryptoPrice,
  buyCrypto,
  name: 'transak'
}


