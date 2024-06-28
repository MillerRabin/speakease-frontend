
import blockchain from "../blockchain.js";
import localContacts from "/components/localContacts/localContacts.js";
import wallets from "/components/wallets/wallets.js";
import ethereum from "../ethereum/ethereum.js";

const queriesMap = {
  'getAllEthTransfers': `query getAllEthTransfers($hash: String!, $_limit: Int, $_nextKey: String) {
    getAllEthTransfers(owner: $hash, limit: $_limit, nextKey: $_nextKey) {
      transfers {
        ...AllEthTransfers
        __typename
      }
      nextKey
      __typename
    }
  }
  
  fragment AllEthTransfers on EthTransfer {
    transfer {
      ...AllTransfers
      __typename
    }
    stateDiff {
      to {
        ...BalanceFragment
        __typename
      }
      from {
        ...BalanceFragment
        __typename
      }
      __typename
    }
    value
    __typename
  }
  
  fragment AllTransfers on Transfer {
    type
    subtype
    transactionHash
    block
    timestamp
    from
    to
    txFee
    status
    validatorIndex
    __typename
  }
  
  fragment BalanceFragment on BalanceDiff {
    before
    after
    __typename
  }`,
  'getAddressERC20Transfers': `query getAddressERC20Transfers($hash: String!, $_limit: Int, $_nextKey: String) {
    getERC20Transfers(owner: $hash, limit: $_limit, nextKey: $_nextKey) {
      transfers {
        ...TransferFragment
        __typename
      }
      nextKey
      __typename
    }
  }
  
  fragment TransferFragment on ERC20Transfer {
    transfer {
      ...TransferSummary
      __typename
    }
    stateDiff {
      to {
        ...BalanceFragment
        __typename
      }
      from {
        ...BalanceFragment
        __typename
      }
      __typename
    }
    value
    contract
    tokenInfo {
      ...TokenFragment
      __typename
    }
    __typename
  }
  
  fragment TransferSummary on Transfer {
    transactionHash
    timestamp
    from
    to
    txFee
    type
    __typename
  }
  
  fragment BalanceFragment on BalanceDiff {
    before
    after
    __typename
  }
  
  fragment TokenFragment on EthTokenInfo {
    name
    symbol
    decimals
    __typename
  }`,
}

export async function getEthHistory(endpoint, address) {
  const url = endpoint.historyProviderUrl;
  const variables = {
    hash: address,
    _limit: 100,
  };
  const history = await Promise.all(Object.entries(queriesMap).map(([operationName, query]) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        variables,
        operationName,
        query
      })
    }).then( async resp => {
      const { data } = await resp.json();
      return Object.values(data)?.pop();
    });
  }));
  return history;
}

function formatEthereumTransferData(endpoint, td, myAddress) {
  const transfer = {};
  transfer.date = td.transfer?.timestamp && td.transfer.timestamp * 1000;
  const operation = td.transfer?.from === myAddress ? 'to' : 'from';
  transfer.input = {
    amount: td.value,
    currency: td.transfer.type,
    recipient: td.transfer.to,
  }
  const fromName = operation === 'to' ? wallets.name : localContacts.getContactByAddress(td.transfer.to);
  const toName = operation === 'to' ? localContacts.getContactByAddress(td.transfer.from): wallets.name;

  transfer.output = {
    blockchain: endpoint.name,
    currency: {
      currency: 'ETH',
      blockchain: endpoint.key,
      family: endpoint.family,
    },
    transactionHash: td.transfer.transactionHash,
    amount: ethereum.format(td.value),
    serviceFee: 0,
    recipient: td.transfer.to,
    sender: td.transfer.from,
    networkFee: parseInt(td.transfer.txFee, 16),
  }
  return { blockchain: endpoint.name, ...transfer, toName, fromName, operation, module: ethereum };
}

function formatERC20Transfer(endpoint, td, address) {
  const tx = formatEthereumTransferData(endpoint, td, address);
  tx.output = {...tx.output, currency: {
    currency: td.tokenInfo?.name,
    blockchain: endpoint.key,
    family: endpoint.family
  }};
  tx.blockchain = endpoint.name;
  tx.input.currency = td.tokenInfo?.name;
  return tx;
}

async function get(endpoint) {
  try {
    const keys = blockchain.getUserWalletKeys();
    const pubkey = keys.ethereum.publicText;
    const transfers = await getEthHistory(endpoint, pubkey);
    let erc20txs;
    let allTxs;
    for (const txs of transfers) {
      if (txs['__typename'] == 'ERC20Transfers') erc20txs = txs.transfers;
      if (txs['__typename'] == 'ETHTransfers') allTxs = txs.transfers;
    }
    const erc20hashes = erc20txs.map( tx => tx.transfer.transactionHash);
    return allTxs.filter(tx => !erc20hashes.includes(tx.transfer.transactionHash))
      .map( tx => formatEthereumTransferData(endpoint, tx, pubkey))
      .concat(erc20txs
      .map( tx => formatERC20Transfer(endpoint, tx, pubkey)));
  } catch (e) {
    console.error(e);
    return [];
  }
}


export default {
 get
}