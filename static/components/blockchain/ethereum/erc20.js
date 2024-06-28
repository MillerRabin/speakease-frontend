import ethereum from "./ethereum.js";

export const nativeFormat = ethereum.nativeFormat;
export const format = ethereum.format;

const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export function getContract(endpoint, contract) {
  return new endpoint.connection.eth.Contract(abi, contract);
}


export async function estimateTransferNetworkFee({ endpoint, sender, recipient, amount }) {
	const transferMethod = await endpoint.contract.methods.transfer(recipient, nativeFormat(amount));	
	const from = sender.ethereum.public;
	return await transferMethod.estimateGas({
		to: recipient,
		from
	});
}

export function getConnection(connection, contract) {
	return {
		connection,
		contract: getContract(connection, contract)
	}
}

function sendSignedTransaction(endpoint, signedTx, hashOnly) {
  return new Promise((resolve, reject) => {
    const sentTx = endpoint.connection.eth.sendSignedTransaction(signedTx.rawTransaction);
    sentTx.on("receipt", receipt => {
      return resolve(receipt);
    });
    sentTx.on('transactionHash', hash => {
      if (hashOnly)
        return resolve(hash);
    });
    sentTx.on("error", err => {
      return reject(err);
    });
  });
}

export async function transfer({ endpoint, sender, recipient, amount }) {
	const contract = endpoint.contract;
	const value = nativeFormat(amount).toString();
	const from = sender.ethereum.publicText;
	const nonce = await endpoint.connection.eth.getTransactionCount(from, 'latest');
	const transferM = contract.methods.transfer;
	const gas = await transferM(recipient, value)
    .estimateGas({
			to: recipient,
			from
  });
	const methodM = transferM.apply(transferM, [recipient, value]);
	const data = methodM.encodeABI();

  try {
		const tx = {
      to: contract._address,
      from,
      gas,
      value: "0x0",
      nonce,
      data
    };
    const signedTx = await endpoint.connection.eth.accounts.signTransaction(tx, sender.ethereum.privateText);
    const hash = await sendSignedTransaction(endpoint, signedTx, false);
    return {
			blockchain: endpoint.name,
      ...hash,
      sender: sender.publicText,
      recipient,
      amount: value,
      networkFee: gas,
      serviceFee:0,
    };
  } catch (err) {
    if (err.message?.includes('insufficient funds')) {
      err.code = 'insufficient-funds';
    }
    console.error(err);
    throw err;
  }
}

export async function getBalance(endpoint, address) {	  
  const balance = await endpoint.contract.methods.balanceOf(address).call();
  return endpoint.connection.utils.fromWei(balance);  
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

export default {
	name: 'erc20',
	transfer,
	nativeFormat,
	format,
	getKeys,
	getContract,
	getBalance,
	getConnection,
	estimateTransferNetworkFee
}