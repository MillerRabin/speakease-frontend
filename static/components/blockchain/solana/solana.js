import { binaryToBase58, base58ToBinary } from '/components/blockchain/converter.js';
import loader from '/components/loader/loader.js';
window.Buffer = window.Buffer ?? window.buffer.Buffer;
const solanaWeb3 = window.solanaWeb3;
const { PublicKey, Keypair } = window.solanaWeb3;

export function getConnection(endpoint) {
  const url = endpoint.node;
  return new solanaWeb3.Connection(url);
}

const LAMPORTS_PER_SOL = BigInt(solanaWeb3.LAMPORTS_PER_SOL);

export async function createSolanaWallet() {
  let account = Keypair.generate();
  const keys = {
    private: binaryToBase58(account.secretKey),
  }
  return keys;
}

async function checkTransfer (endpoint, transaction, pubKey) {
  let signature;
  while (!signature) {
    if (transaction.signatures[0]) {
      signature = binaryToBase58(transaction.signatures[0]?.signature);
    }
    await loader.sleep(100);
  }
  return new Promise(async (resolve, reject) => {
    let done = false;
    setTimeout(() => {
      reject(null);
      done = true;
    }, 600000);
    while (!done) {
      const [ signedTransaction ] = await endpoint.connection.getSignaturesForAddress(pubKey, {limit:1});
      if (signedTransaction?.signature === signature ) {
        if (signedTransaction.confirmationStatus === 'finalized') {
          return resolve(signature);
        } else {
          if (signedTransaction.err) reject(signedTransaction.err);
          return reject(new Error('Something wrong with transaction'));
        }
      }
      await loader.sleep(1000);
    }
  });
}

export async function getBalance(endpoint, publicKey) {   
  const walletKey = new solanaWeb3.PublicKey(publicKey);
  const balance = await endpoint.connection.getBalance(walletKey);
  return balance / solanaWeb3.LAMPORTS_PER_SOL;
}

function formatPrivateKey(senderPrivateKey) {
  if (typeof senderPrivateKey == 'object')      
    return Uint8Array.from(Object.values(senderPrivateKey));
  if (Array.isArray(senderPrivateKey))
    return Uint8Array.from(senderPrivateKey);
  if (typeof senderPrivateKey === 'string') 
     return base58ToBinary(senderPrivateKey);
  return senderPrivateKey;  
}

async function handledTransfer(endpoint, transaction, keypair) {
  const hash = await Promise.any([
    solanaWeb3.sendAndConfirmTransaction(endpoint.connection, transaction, [keypair]),
    checkTransfer(endpoint, transaction, keypair.publicKey)
  ]);
  return hash;
}


export async function transfer({ endpoint, recipient, amount, sender, serviceFee }) {        
  const ka = formatPrivateKey(sender.solana.private);
  const keypair = Keypair.fromSecretKey(ka);
  const recentBlockhash = await endpoint.connection.getRecentBlockhash();
  const transaction = new solanaWeb3.Transaction({
    recentBlockhash: recentBlockhash.blockhash,
    feePayer: keypair.publicKey,
  });
  transaction.add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: recipient,
      lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
    })
  );
  
  const fee = await estimateTransferNetworkFee({ endpoint, recipient, amount, sender });
  try {
    const transactionHash = await handledTransfer(endpoint, transaction, keypair);
    return {
      blockchain: endpoint.name,
      result: {
        transactionHash,
        sender: keypair.publicKey.toBase58(),
        recipient,
        amount: amount * solanaWeb3.LAMPORTS_PER_SOL,
        networkFee: format(fee),
        serviceFee: serviceFee,
        blockchainCode: endpoint.name,
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }      
}

export async function estimateTransferNetworkFee({endpoint, recipient, amount, sender }) {
  const ka = formatPrivateKey(sender.solana.private);
  const keypair = Keypair.fromSecretKey(ka);
  const transaction = new solanaWeb3.Transaction();    
  transaction.add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: recipient,
      lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
    })
  );
  const { blockhash } = await endpoint.connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;  
  transaction.feePayer = keypair.publicKey;

  const feeForMessage = await endpoint.connection.getFeeForMessage(
    transaction.compileMessage(),
    'confirmed'
  );
  const feeInLamports = feeForMessage.value;
  return BigInt(feeInLamports);
}

export function getTransferFee(endpoint, amount) {
  const transferFee = endpoint.transferFee;
  return BigInt(solanaWeb3.LAMPORTS_PER_SOL * transferFee * amount);
}

export function nativeFormat(amount) {
  return BigInt(amount * solanaWeb3.LAMPORTS_PER_SOL);
}

export function format(lamports) {
  if (lamports instanceof BigInt)
    return lamports / LAMPORTS_PER_SOL;
  return Number(lamports) / solanaWeb3.LAMPORTS_PER_SOL;
}

export function getKeys(_, wallet) {
  const ka = formatPrivateKey(wallet.solana.private);
  const keypair = Keypair.fromSecretKey(ka);
  return {
    public: keypair.publicKey,
    private: keypair.secretKey,
    publicText: keypair.publicKey.toBase58(),
    privateText: binaryToBase58(keypair.secretKey)
  }
}

function isPrivateKeyValid(privateKey) {
  try {
    const privateKeyBinary = base58ToBinary(privateKey);
    Keypair.fromSecretKey(privateKeyBinary);
    return true;
  } catch {
    return false;
  }
}

function isPublicKeyValid(publicKey) {
  try {
    const address = new PublicKey(publicKey);
    PublicKey.isOnCurve(address)
    return true;
  } catch {
    return false;
  }
}

export default {
  name: 'solana',
  getConnection,
  format,
  nativeFormat,
  estimateTransferNetworkFee,
  getTransferFee,
  getBalance,
  transfer,
  getKeys,  
  isPrivateKeyValid,
  isPublicKeyValid,
  getRandomKeys: createSolanaWallet,
}

