import { blockchainEndpointsConfig, blockchainEndpoints, currencies, providers } from "/config.js";
import users from "/components/users/users.js";
import wallets from "/components/wallets/wallets.js";

export async function getBalance(endpoint, address) {  
  return await endpoint.module.getBalance(endpoint, address);    
}

export async function transfer({ currency, recipient, amount, serviceFee, blockchain }) {
  const sender = getUserKeys(currency);
  const fbn = getCurrencyEndpoint(currency, blockchain);
  if (fbn.module.transfer == null) throw new Error(`${fbn.name}.module.transfer is not implemented`);
  const res = await fbn.module.transfer({ endpoint: fbn, sender, recipient, amount, serviceFee });  
  res.currency = currency;
  res.blockchain = fbn.name;
  if (fbn.history.save != null)
    fbn.history.save(res);
  return res;
}

export async function estimateTransferNetworkFee({ currency, blockchain, recipient, amount }) {
  const senderData = getUserKeys(currency);
  const fbn = getCurrencyEndpoint(currency, blockchain);
  if (fbn.module.estimateTransferNetworkFee == null) throw new Error(`${fbn.name}.estimateNetworkFee is not implemented`);
  return await fbn.module.estimateTransferNetworkFee({ endpoint: fbn, sender: senderData, recipient, amount });
}

export function format({ currency, amount, blockchain }) {
  const fbn = getCurrencyEndpoint(currency, blockchain);
  if (fbn.module.format == null) throw new Error(`${fbn.module.name}.format is not implemented`);
  return fbn.module.format(amount);
}

export function getTransferFee({ currency, amount, blockchain }) {
  const endpoint = getCurrencyEndpoint(currency, blockchain);
  const fee = endpoint.transferFee ?? 0;
  return fee * amount;
}

export function nativeFormat({ currency, amount, blockchain }) {
  const fbn = getCurrencyEndpoint(currency, blockchain);
  if (fbn.module.nativeFormat == null) throw new Error(`${fbn.name}.module.nativeFormat is not set`);
  return fbn.module.nativeFormat(amount);
}

export function getByName(name) {
  const lName = name.toLowerCase();
  const ab = [
    ...Object.values(blockchainEndpointsConfig.testnets),
    ...Object.values(blockchainEndpointsConfig.mainnets),
    ...Object.values(blockchainEndpointsConfig.known)
  ];
  const res = ab.find(c => c.name.toLowerCase() == lName);
  if (res == null) throw new Error(`Blockchain ${name} is not found`);
  return res;  
}

export async function generateRandomKeys() {
  const mainFamilies = [...new Set(Object.values(blockchainEndpoints).map(bc => bc.family))]
  const wallet = {};
  for (const family of mainFamilies) {
    const endpoint = blockchainEndpoints[family];
    wallet[family] = await endpoint.module.getRandomKeys();
  }
  return wallet;
}

export function getKeys(key, wallet) {
  const targetCurrency = getCurrency(key.toUpperCase());
  if (targetCurrency == null) throw new Error(`Currency ${key} is not supported`);
  const res = {};  
  for (const bKey in targetCurrency.blockchains) {
    const tb = targetCurrency.blockchains[bKey];
    res[tb.family] = tb.module.getKeys(tb, wallet);    
  }
  return res;  
}

export function getUserKeys(currency) {
  if (currency == null) throw new Error('Currency must be received');
  const user = users.getUser();
  if (user == null) throw new Error('you are not authorized');
  const { wallets: wallet } = wallets.getWalletByUser(user);
  return getKeys(currency, wallet);
}

export function getUserWalletKeys() {
  const user = users.getUser();
  if (user == null) throw new Error('you are not authorized');
  const { wallets: wallet } = wallets.getWalletByUser(user);
  const res = {};
  for (const k in wallet) {
    try {
      const endpoint = blockchainEndpoints[k.toLowerCase()];
      if (endpoint == null) throw new Error(`Blockchain ${k} is not supported`);
      const key = endpoint.module.getKeys(endpoint, wallet);
      res[k] = { key: k, ...key };
    } catch {
      continue;
    }
    
  }
  return res;
}

export function blockchainsByFamily() {
  const res = {};
  for (const key in blockchainEndpoints) {
    const bc = blockchainEndpoints[key];
    res[bc.module.name] = res[bc.module.name] == null ? [] : res[bc.module.name];
    res[bc.module.name].push(bc.name);
  }
  return res;
}

export function getBlockchainFamily(blockchain) {
  const bc = blockchainEndpoints[blockchain];
  if (bc == null) throw new Error(`Blockchain ${blockchain} is not supported`);
  return bc.module.name;
}


export function getCurrency(currency, throwException = true) {  
  const cur = currencies[currency];
  if (throwException && cur == null) throw new Error(`Currency ${currency} is not supported`);
  return cur;
}

export function getCurrencyBlockchains(currency) {
  const cur = getCurrency(currency);
  return Object.values(cur.blockchains);
}

const networkMap = {
  'bsc': 'binance',
  'mainnet': 'bitcoin'
}

export function getCurrencyEndpoint(currency, blockchain, throwException = true) {  
  const cur = getCurrency(currency);
  if (blockchain == null) {
    const bcs = Object.values(cur.blockchains);
    if (bcs.length > 1) throw new Error(`Currency ${currency} has more than one blockchain`);
    return bcs[0]
  }
  const bName = networkMap[blockchain] ?? blockchain;
  const bc = cur.blockchains[bName];
  if (throwException && bc == null) throw new Error(`blockchain ${ blockchain } is not supported for currency ${ currency }`);
  return bc;
}

export function getCurrencies() {
  return Object.values(currencies).sort((a, b) => {
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return 0;
  });
}

export function getProviders() {
  return Object.values(providers).sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
}

export function getProvider(provider) {
  const prov = providers[provider];
  if (prov == null) throw new Error(`Buy provider ${provider} is not supported`);
  return prov;
}

export async function getProviderCryptoCurrencies(provider) {
  const prov = getProvider(provider);
  return await prov.module.getCryptoCurrencies();
}

export async function getProviderFiatCurrencies(provider) {
  const prov = getProvider(provider);
  return await prov.module.getFiatCurrencies();
}

export function getCurrenciesByFamily(family) {
  const currencies = getCurrencies();
  return currencies.filter( cur => {
    return Object.values(cur.blockchains).some( bc => bc.family === family);
  });
}

export async function getProviderBuyCryptoPrice({ 
  provider, 
  cryptoCurrency,
  cryptoAmount,
  fiatCurrency, 
  fiatAmount,
  blockchain,
  paymentOption
}) {
  const prov = getProvider(provider);
  return await prov.module.getBuyCryptoPrice({ 
    cryptoCurrency,
    cryptoAmount,
    fiatCurrency, 
    fiatAmount,
    blockchain,
    paymentOption
  });
}

export async function buyCrypto({ 
  provider, 
  cryptoCurrency,
  cryptoAmount,
  fiatCurrency, 
  fiatAmount,
  blockchain,
  paymentOption
}) {
  const bc = getBlockchain(blockchain);
  const keys = getUserKeys(cryptoCurrency);
  const targetKey = keys[bc.family];
  const prov = getProvider(provider);
  return await prov.module.buyCrypto({ 
    cryptoCurrency,
    cryptoAmount,
    fiatCurrency, 
    fiatAmount,
    walletAddress: targetKey.publicText,
    blockchain,
    paymentOption
  });
}

export function getBlockchain(key, throwException = true) {
  const bc = blockchainEndpoints[key];
  if (throwException && bc == null) throw new Error(`blockchain with key ${ key } is not found`);
  return bc;
}

export default {
  format,
  nativeFormat,
  getTransferFee,
  getBalance,
  transfer,
  getByName,
  estimateTransferNetworkFee,
  getUserKeys,
  getUserWalletKeys,
  blockchainsByFamily,
  getBlockchainFamily,
  getCurrencies,
  getCurrency,
  getCurrencyEndpoint,
  getCurrencyBlockchains,
  getProviders,
  getProvider,
  getProviderCryptoCurrencies,
  getProviderFiatCurrencies,
  getProviderBuyCryptoPrice,
  getBlockchain,
  buyCrypto,
  getCurrenciesByFamily
}