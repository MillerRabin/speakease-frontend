import tron from "./tron.js";

export const nativeFormat = tron.nativeFormat;
export const format = tron.format;
export const getKeys = tron.getKeys;


export async function estimateTransferNetworkFee() {
	return 1000000;
}

export async function transfer({ endpoint, recipient, amount }) {
	const tronWeb = tron.getTronObject(endpoint);	  
	const contract = await tronWeb.contract().at(endpoint.contract);
	const result = await contract.transfer(
		recipient,
		amount
	).send({
		feeLimit: 1000000
	});
	return result;
}

export async function getBalance(endpoint, address) {
	const tronWeb = tron.getTronObject(endpoint);	  
	const contract = await tronWeb.contract().at(endpoint.contract);
	const result = await contract.balanceOf(address).call();
	return format(result);
}

export default {
	name: 'trc20',
	transfer,
	nativeFormat,
	format,
	getKeys,
	getBalance,
	estimateTransferNetworkFee
}