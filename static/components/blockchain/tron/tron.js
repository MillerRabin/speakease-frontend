import users from "/components/users/users.js";
import wallets from "/components/wallets/wallets.js";

const TronWeb = window.TronWeb;
const MULTITPLIER = 1000000;

export function getConnection() {  
  return null;
}

export function getKeys() {        
  const tronKey = getTronPrivateKey();
  const address = TronWeb.address.fromPrivateKey(tronKey.private);
  return {
    public: address,
    private: tronKey.private,
    publicText: address,
    privateText: tronKey.private
  }
}

function getTronPrivateKey() {
  const user = users.getUser();
  return user.wallet.wallets.tron ?? addTronKey();
}

function addTronKey() {
  const rnd = TronWeb.utils.accounts.generateAccount();    
  return wallets.updatePrivateKey('tron', rnd.privateKey);
}

function getRandomKeys() {
  const { privateKey } = TronWeb.utils.accounts.generateAccount();
  return { private: privateKey };
}

export function getTronObject(endpoint) {  
  const priv = getTronPrivateKey();
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider(endpoint.node);
  const solidityNode = new HttpProvider(endpoint.node);
  const eventServer = new HttpProvider(endpoint.node);
  const privateKey = priv.private;
  return new TronWeb(fullNode, solidityNode, eventServer, privateKey);
}

export async function getBalance(endpoint, address) {  
  const tronWeb = getTronObject(endpoint);
  return format(await tronWeb.trx.getBalance(address));
}

export async function estimateTransferNetworkFee() {
  return 0;
}

export async function transfer({ endpoint, sender, recipient, amount }) {
  const tronWeb = getTronObject(endpoint);
  const tradeobj = await tronWeb.transactionBuilder.sendTrx(
    recipient,
    amount,
    sender.publicText
  );
  
  const signedtxn = await tronWeb.trx.sign(
    tradeobj,
    sender.privateText
  );

  return await tronWeb.trx.sendRawTransaction(
      signedtxn
  )
}

function isPrivateKeyValid(privateKey) {
  try {
    const addr = TronWeb.address.fromPrivateKey(privateKey);
    if (!addr) return false;
    return true;
  } catch {
    return false;
  }
}

function isPublicKeyValid(publicKey) {
  const mt = publicKey.match(/T[A-Za-z1-9]{33}/);
  return mt != null;
}

export function nativeFormat(amount) {
  return amount * MULTITPLIER;
}

export function format(amount) {
  if (amount.toNumber != null) return amount.toNumber();
  return amount / MULTITPLIER;
}

export default {
  name: 'tron',
  format,
  estimateTransferNetworkFee,
  nativeFormat,  
  getBalance,
  getTronObject,
  transfer,
  isPrivateKeyValid,
  isPublicKeyValid,
  getKeys,
  getConnection,
  getRandomKeys,
};