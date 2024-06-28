import { getTxs } from '../bitcoin/bitcoin.js';
import blockchain from "../blockchain.js";
import localContacts from "/components/localContacts/localContacts.js";
import bitcoin from '../bitcoin/bitcoin.js';

const formatBtcTxData = (endpoint, tx, pubkey) => {
  const transfer = {};
  transfer.date = new Date(tx.status.block_time * 1000);
  const operation = (tx.vin.every( v => v.prevout.scriptpubkey_address === pubkey)
    ? 'to'
    : 'from');
  const outTx = operation === 'to'
    ? tx.vout.find( vo => vo.scriptpubkey_address !== pubkey)
    : tx.vout.find( vo => vo.scriptpubkey_address === pubkey);
  transfer.input = {
    amount: outTx.value,
    currency: 'BTC',
    recipient: outTx.scriptpubkey_address,
  }

  const senders = [...new Set(tx.vin.map( v => v.prevout.scriptpubkey_address))];
  const recipients = [...new Set(tx.vout.map( v => v.scriptpubkey_address))];
  const fromNames = senders.map( sender => localContacts.getContactByAddress(sender));
  const toNames = recipients.map( recipient => localContacts.getContactByAddress(recipient));

  transfer.output = {
    currency: {
      currency: 'BTC',
      blockchain: endpoint.key,
      family: endpoint.family,
    },
    transactionHash: tx.txid,
    amount: bitcoin.format(outTx.value),
    serviceFee: 0,
    recipient: outTx.scriptpubkey_address,
    recipients, 
    sender: senders[0],
    senders,
    networkFee: tx.fee
  }
  return { blockchain: endpoint.name, ...transfer, toNames, fromNames, operation };
}

async function get(endpoint) {
  const keys = blockchain.getUserWalletKeys();
  const pubkey = keys.bitcoin.publicText;
  try {
    const data = await getTxs(endpoint, pubkey);
    return data.map( tx => formatBtcTxData(endpoint, tx, pubkey));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default {
  get
}