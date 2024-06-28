import blockchain from "../blockchain.js";
import wallets from "/components/wallets/wallets.js";
import localContacts from "/components/localContacts/localContacts.js";
import ethereum from "../ethereum/ethereum.js";

export async function getKlaytnHistory(endpoint, address) {
  const historyEndpoint = endpoint.historyProviderUrl;
  const url = `${historyEndpoint}/accounts/${address}/txs`
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  return await resp.json();  
}

const formatKlaytnHistory = (endpoint, tx, pubkey) => {
  const transfer = {};
  transfer.date = tx.createdAt * 1000;
  const operation = (tx.fromAddress.toLowerCase() === pubkey.toLowerCase()
    ? 'to'
    : 'from');
  transfer.input = {
    amount: tx.amount,
    currency: 'KLAY',
    recipient: tx.toAddress,
  }
  const fromName = operation === 'to' ? wallets.name : localContacts.getContactByAddress(tx.fromAddress);
  const toName = operation === 'to' ? localContacts.getContactByAddress(tx.toAddres): wallets.name;

  transfer.output = {
    currency: {
      currency: 'KLAY',
      blockchain: endpoint.key,
      family: endpoint.family,
    },
    transactionHash: tx.txHash,
    amount: ethereum.format(tx.amount),
    serviceFee: 0,
    recipient: tx.toAddress,
    sender: tx.fromAddress,
    networkFee: tx.txFee
  }
  return { blockchain: endpoint.name, ...transfer, toName, fromName, operation };
}

async function get(endpoint) {
  try {
    const keys = blockchain.getUserWalletKeys();
    const pubKey = keys.ethereum.publicText;
    const txs = await getKlaytnHistory(endpoint, pubKey);
    return txs.result?.map( tx => formatKlaytnHistory(endpoint, tx, pubKey));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default {
  get
}