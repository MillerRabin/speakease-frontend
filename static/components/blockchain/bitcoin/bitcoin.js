import loader from "/components/loader/loader.js";
import { blockchainEndpoints } from "/config.js";

const multiplier = 100000000;

export function getConnection(endpoint) {
  return { 
    esplora_url: `https://blockstream.info/${endpoint.networkCode == 'mainnet' ? '' : `${endpoint.networkCode}/` }api`
  }
}

export async function getBalance(endpoint, address) {
  const bal = await getUtxoSum(endpoint, address);
  return bal / multiplier;
}

export async function getBalanceNative(endpoint, address) {
  const res = await fetch(`${endpoint.node}/api/v2/address/${address}?confirmed=true`, endpoint.options);
  const text =  await res.text();
  const obj = JSON.parse(text);  
  const bal = Number(obj.balance);
  return bal;
}

export async function getUtxoSum(endpoint, address) {
  const res = await getUtxo(endpoint, address);
  let sum = 0;
  for (const item of res)
    sum += Number(item.value);    
  return sum;
}

async function getUtxo(endpoint, address) {  
  const res = await loader.fetch(`${endpoint.node}/api/v2/utxo/${address}`, endpoint.options);
  const text =  await res.text();
  return JSON.parse(text);
}


export async function getTxs(endpoint, address) {
  const txsResp = await fetch(`${endpoint.connection.esplora_url}/address/${address}/txs`);  
  const text =  await txsResp.text();
  if (!txsResp.ok) throw text;
  const txs = JSON.parse(text);
  const wtxs = [];
  for (const tx of txs) {
    const la = tx.vout.find( v => v.scriptpubkey_address === address);
    if (la == null) continue;
    const wtx = { ...tx };    
    wtx.witnessUtxo = {
      script: window.Buffer.from(la?.scriptpubkey,'hex'),
      value: la?.value
    }
    wtxs.push(wtx);
  }
  return wtxs;
}

export function getTransferFee(endpoint, amount) {
  const transferFee = endpoint.transferFee;
  return transferFee * amount * multiplier;
}

export function estimateTransferNetworkFee() {
 return 368;
}

export function nativeFormat(amount) {
  return Number(amount) * multiplier; 
}

export function format(amount) {
  let res = Number(amount) / multiplier;
  if (Math.abs(res) < 1.0) {
    const e = parseInt(res.toString().split('e-')[1]);
    if (isNaN(e)) return res; 
    res *= Math.pow(10,e-1);
    res = '0.' + (new Array(e)).join('0') + res.toString().substring(2);
  }
  return res; 
}

async function sendtx(endpoint, txHash) {
  const res = await loader.fetch(`${endpoint.node}/api/v2/sendtx/${txHash}`, endpoint.options);
  const text =  await res.text();
  if (!res.ok) throw new Error(text); 
  return JSON.parse(text);  
}

async function getUtxoScriptPubKey(endpoint, utxos, address) {
  const txs = await getTxs(endpoint, address);
  let total = 0;
  for (const utxo of utxos) {
    const ttx = txs.find(t => t.txid == utxo.txid);
    const la = ttx.vout.find( v => v.scriptpubkey_address === address)
    if (la == null) throw new Error(`Can't obtain scriptpub key for transaction ${utxo.txid} in ${endpoint.networkCode}`)
    total += la.value;
    utxo.witnessUtxo = {
      script: window.Buffer.from(la.scriptpubkey,'hex'),
      value: la.value,
    };          
  }  
  return { 
    utxos,
    total
  }
}

async function transferInternal({ endpoint, sender, recipient, amount, fee }) {
  const keyPair = window.bitcoin.ECPair.fromWIF( sender.bitcoin.privateText, endpoint.network );  
  const addr = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: endpoint.network });
  const sendAmount = Math.trunc(nativeFormat(amount));  
  const tutxos = await getUtxo(endpoint, addr.address);
  const { total, utxos } = await getUtxoScriptPubKey(endpoint, tutxos, addr.address);  
  const whatIsLeft = total - fee - sendAmount;
  const tx = new window.bitcoin.TransactionBuilder(endpoint.network);  
  for (let i = 0; i < utxos.length; i++) {
    const ctx = utxos[i];     
    tx.addInput(ctx.txid, ctx.vout,  null, ctx.witnessUtxo.script);
  }

  tx.addOutput(recipient, sendAmount);
  if (whatIsLeft > 0)
    tx.addOutput(addr.address, whatIsLeft);
    
  for (let i = 0; i < utxos.length; i++) {
    const ctx = utxos[i];
    tx.sign(i, keyPair, null, null, ctx.witnessUtxo.value);
  }

  const txHash = tx.build().toHex();  
  const res = await sendtx(endpoint, txHash);  
  return {
    transactionHash: res.result,
    sender: addr.address,
    recipient,
    amount: sendAmount,
    networkFee: fee,
    serviceFee: 0,
    blockchainCode: endpoint.name
  };
}

function getNewFeeFromError(e) {
  const str = e.message;
  const match = str.match(/(\d+) < (\d+)/);
  if (match == null) return null;
  const tFee = match[2];
  return tFee;
}

export async function transfer({ endpoint, sender, recipient, amount }) {
  let fee = estimateTransferNetworkFee();
  const maxTry = 5;
  for (let i = 0; i < maxTry; i++) {
    try {
      return await transferInternal({ endpoint, sender, recipient, amount, fee})
    }
    catch (e) {
      const nFee = getNewFeeFromError(e);
      if (nFee != null) {
        fee = Number(nFee);
        continue;
      }
      throw e;
    }    
  }
}

export async function getRandomKeys() {
  const endpoint = blockchainEndpoints.bitcoin;
  const pKey = await window.bitcoin.ECPair.makeRandom({ network: endpoint.network }).toWIF();
  const res = {
    private: pKey,
  }
  return res;
}

export function getKeys(endpoint, wallet) {
  const keyPair = window.bitcoin.ECPair.fromWIF( wallet.bitcoin.private, endpoint.network );
  const addr = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: endpoint.network });
  return { 
    public: addr.address, 
    private: wallet.bitcoin.private,
    publicText: addr.address, 
    privateText: wallet.bitcoin.private 
  };
}


function isPrivateKeyValid(privateKey) {
  const endpoint = blockchainEndpoints.bitcoin;
  try {
    window.bitcoin.ECPair.fromWIF(privateKey, endpoint.network );
    return true;
  } catch {
    return false;
  }
 
}
export default {
  name: 'bitcoin',
  format,
  getTransferFee,
  estimateTransferNetworkFee,
  nativeFormat,  
  getBalance,
  transfer,
  isPrivateKeyValid,
  getKeys,
  getConnection,
  getRandomKeys,
}