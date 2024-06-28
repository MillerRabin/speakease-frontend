const { PublicKey, LAMPORTS_PER_SOL } = window.solanaWeb3;
import localContacts from "/components/localContacts/localContacts.js";
import wallets from "/components/wallets/wallets.js";
import blockchain from "../blockchain.js";
import solana from "../solana/solana.js";

async function get(endpoint) {
  const keys = blockchain.getUserWalletKeys();
  const history = await getSolanaHistory(endpoint, keys.solana.publicText);
  const result = history.map( th => formatSolanaTransferData(endpoint, th, keys.solana.publicText));
  return result;
}

function formatSolanaTransferData(endpoint, td, myAddress) {
  const transfer = {};
  transfer.date = td.date;
  const operation = td.source === myAddress ? 'to' : 'from';
  transfer.input = {
    amount: td.lamports,
    currency: 'SOL',
    recipient: td.destination,
  }
  const fromName = operation === 'to' ? wallets.name : localContacts.getContactByAddress(td.source);
  const toName = operation === 'to' ? localContacts.getContactByAddress(td.destination): wallets.name;

  transfer.output = {
    currency: {
      currency: 'SOL',
      blockchain: endpoint.key,
      family: endpoint.family
    },
    transactionHash: td.hash,
    amount: solana.format(td.lamports),
    serviceFee: 0,
    recipient: td.destination,
    sender: td.source,
    networkFee: td.networkFee
  }
  return { blockchain: endpoint.name, ...transfer, toName, fromName, operation, module: 'solana' };
}

export async function getSolanaHistory(endpoint, address) {
  try {
    const pubKey = new PublicKey(address);
    const transactionList = await endpoint.connection.getSignaturesForAddress(pubKey, { limit:1000 });
    const signatureList = transactionList.map( ({signature }) => signature);
    const transactionDetails = await endpoint.connection.getParsedTransactions(signatureList, { maxSupportedTransactionVersion:0 });
    const history = [];
    for( const detail of transactionDetails)
      addTransactionHistoryItem(history, detail);
    return history;
  } catch (e) {
    console.error(e);
    return [];
  }
  
}

function addTransactionHistoryItem(history, detail) {
  const date = new Date(detail.blockTime * 1000).valueOf();
  const instructions = detail.transaction.message.instructions;  
  for (const { parsed } of instructions) {
    if (parsed == null) continue;
    const { info } = parsed;
    history.push({
      ...info,
      date,
      hash: detail.transaction.signatures.join(','),
      networkFee: detail.meta.fee,
      value: info.lamports / LAMPORTS_PER_SOL
    });
  }
}

export default {
  get
}
