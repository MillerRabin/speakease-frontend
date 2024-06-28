import '/components/blockchain/ethereum/ethDist.js';
import { blockchainEndpoints } from '/config.js';

export async function getBalance(endpoint, address) {
  const bal = await endpoint.connection.eth.getBalance(address);
  return endpoint.connection.utils.fromWei(bal.toString());
}

export async function estimateTransferNetworkFee({ endpoint, sender, recipient, amount }) {
  const from = sender.ethereum.public;
  const transaction = {
    from,
    to: recipient,
    value: endpoint.connection.utils.toHex(endpoint.connection.utils.toWei(amount.toString(), "ether")),
  };
  return BigInt(await endpoint.connection.eth.estimateGas(transaction));  
}

export function format(amount) {
  return window.Web3.utils.fromWei(amount.toString());
}

export async function transfer({ endpoint, sender, recipient, amount }) {
  try {
    const transaction = {
      from: sender.ethereum.publicText,
      to: recipient,
      value: endpoint.connection.utils.toHex(endpoint.connection.utils.toWei(amount.toString(), "ether")),
    };
    transaction.gas = (await estimateTransferNetworkFee({ endpoint, sender, recipient, amount })).toString();
    const signedTx = await endpoint.connection.eth.accounts.signTransaction(transaction, sender.ethereum.privateText );    
    const result = await endpoint.connection.eth.sendSignedTransaction(signedTx.rawTransaction);
    return { 
      ...result,
      sender: sender.ethereum.publicText,
      recipient,
      amount: transaction.value,
      networkFee: transaction.gas,
      serviceFee: 0
    };
  } catch (e) {
    const msg = e.message;
    if (msg.includes('insufficient funds')) {
      e.code = 'insufficient-funds';
      throw e;
    }
    console.error(e);
    throw e;
  }
}

export function getTransferFee(_, amount, transferFee) {
  const total = amount * transferFee;
  return nativeFormat(total.toString());
}

export function nativeFormat(amount) {
  return BigInt(window.Web3.utils.toWei(amount.toString(), "ether"));
}

export function getKeys(endpoint, wallet) { 
  const privateKey = wallet.ethereum.private;
  const pbl = endpoint.connection.eth.accounts.privateKeyToAccount(privateKey);
  return { 
    public: pbl.address, 
    private: privateKey,
    publicText: pbl.address, 
    privateText: privateKey 
  };
}

export function isPrivateKeyValid(privateKey) {
  try {
    if (!privateKey.startsWith('0x')) return false;
    const endpoint = blockchainEndpoints.ethereum;
    endpoint.connection.eth.accounts.privateKeyToAccount(privateKey);
    return true;
  } catch {
    return false;
  }
}

export async function getRandomKeys() {
  const endpoint = blockchainEndpoints.ethereum;
  const { privateKey } = endpoint.connection.eth.accounts.create();
  return { private: privateKey };
}

export function getConnection(endpoint) {
  const { Web3 } = window;
  const web3Provider = new Web3.providers.HttpProvider(endpoint.node, endpoint.options);
  return new Web3(web3Provider);
}

export default {
  name: 'ethereum',
  getConnection,
  isPrivateKeyValid,
  getTransferFee,
  nativeFormat,
  format,
  getBalance,
  estimateTransferNetworkFee,
  transfer,
  getKeys,
  getRandomKeys,
}