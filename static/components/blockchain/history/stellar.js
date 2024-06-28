import { blockchainEndpoints } from '/config.js';
const StellarSdk = window.StellarSdk;
import wallets from "/components/wallets/wallets.js";
import users from "/components/users/users.js";
import localContacts from "/components/localContacts/localContacts.js";

function formatTransferData(endpoint, td, myAddress, wallet) {
  const transfer = {};
  transfer.date = new Date(td.date);
  const operation = td.sender === myAddress ? 'to' : 'from';
  const [tx_data ] = td.operations;
  const amount = tx_data.type === 'payment' ? tx_data.amount : tx_data.startingBalance;
  transfer.input = {
    amount: tx_data.type === 'payment' ? tx_data.amount : tx_data.startingBalance,
    currency: tx_data.asset?.code ?? 'XLM',
    recipient: tx_data.destination,
  }
  const fromName = operation === 'to' ? wallet.name : localContacts.getContactByAddress(td.sender);
  const toName = operation === 'to' ? localContacts.getContactByAddress(tx_data.destination): wallet.name;

  transfer.output = {
    currency: {
      currency: 'XLM',
      blockchain: endpoint.key,
      family: endpoint.family
    },
    transactionHash: td.hash,
    amount,
    serviceFee: td.service_fee,
    recipient: tx_data.destination,
    sender: td.sender,
    networkFee: td.fee
  }
  return { blockchain: endpoint.name, ...transfer, toName, fromName, operation, module: 'stellar' };
}

export async function get(bc) {
  const server = new StellarSdk.Server(blockchainEndpoints.stellar.connection);
  const wallet = wallets.get();
  const user = users.getUser();
  const keyPair = bc.module.getKeys(null,wallet[user.id]?.wallets);
  try {
    const txs = await server.transactions()
      .forAccount(keyPair.public)
      .call();
    const restoredTxs = await Promise.all(txs.records.map( tx => {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(tx.envelope_xdr, '');
      return {
        date: tx.created_at,
        operations: transaction.operations,
        fee: tx.fee_charged,
        sender: tx.source_account,
        hash: tx.hash,
        service_fee: 0,
      };
    }));
    return restoredTxs.map( t => formatTransferData(bc, t, keyPair.public, wallet[user.id]));
  } catch (e) {
    console.log(e);
    return [];
  }
}

export default {
  get
}