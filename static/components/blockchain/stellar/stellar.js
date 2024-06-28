import { blockchainEndpoints } from '/config.js';
import wallets from "/components/wallets/wallets.js";

const StellarSdk = window.StellarSdk;

async function makeTransaction(server, inputData) {
    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    const account = await server.loadAccount(inputData.sourcePublicKey);
  
    // Right now, there's one function that fetches the base fee.
    // In the future, we'll have functions that are smarter about suggesting fees,
    // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    const fee = await server.fetchBaseFee();
  
  
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee,
        // Uncomment the following line to build transactions for the live network. Be
        // sure to also change the horizon hostname.
        // networkPassphrase: StellarSdk.Networks.PUBLIC,
        networkPassphrase: inputData.endpoint.networkCode == 'testnet' ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC
      })
      // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.payment({
        destination: inputData.recipient,
        // The term native asset refers to lumens
        asset: StellarSdk.Asset.native(),
        // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
        // the decimal. They are represented in JS Stellar SDK in string format
        // to avoid errors from the use of the JavaScript Number data structure.
        amount: inputData.amount,
      }))
      // Make this transaction valid for the next 30 seconds only
      .setTimeout(30)
      // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
      // .addMemo(StellarSdk.Memo.text('Hello world!'))
      .build();
  
    // Sign this transaction with the secret key
    // NOTE: signing is transaction is network specific. Test network transactions
    // won't work in the public network. To switch networks, use the Network object
    // as explained above (look for StellarSdk.Network).
    transaction.sign(inputData.sourceKeypair);
  
    // Let's see the XDR (encoded in base64) of the transaction we just built
    // console.log(transaction.toEnvelope().toXDR('base64'));
  
    // Submit the transaction to the Horizon server. The Horizon server will then
    // submit the transaction into the network for us.
    try {
      const transactionResult = await server.submitTransaction(transaction);
      // console.log(JSON.stringify(transactionResult, null, 2));
      // console.log('\nSuccess! View the transaction at: ');
      // console.log(transactionResult._links.transaction.href);
      return { 
        transactionResult,
        sender: inputData.sender.stellar.publicText,
        recipient: inputData.recipient,
        amount: inputData.amount,
        networkFee: fee,
        serviceFee: 0
      };
    } catch (e) {
      console.log('An error has occurred:');
      console.log(e);
    }
}

export function getConnection(endpoint) {
  return endpoint == 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';
}

export function getKeys(_, wallet) {
  let stellarWalletData = null;
  if(!wallet?.stellar) {
    stellarWalletData = addStellarWallet();
  }
  const keypair  = StellarSdk.Keypair.fromSecret(wallet?.stellar?.private || stellarWalletData?.private);
  return {
    public: keypair.publicKey(),
    private: keypair.secret(),
    publicText: keypair.publicKey(),
    privateText: keypair.secret()
  }
}

function addStellarWallet() {
    const stellarWalletData = createStellarWallet();
    return wallets.updatePrivateKey('stellar', stellarWalletData.private);    
}

export async function getBalance(_, address) {
  const endpoint = blockchainEndpoints.stellar.connection;
  const server = new StellarSdk.Server(endpoint);
  try {
    const account = await server.loadAccount(address);
    return Number.parseFloat(account.balances.find(b => b.asset_type == 'native').balance);
  } catch (e) {
    if (e.name == 'NotFoundError') return 0;
    console.error(e);
  }
}

export function createStellarWallet() {
  const pair = StellarSdk.Keypair.random();
  return {
    private: pair.secret()
  }
}

export async function estimateTransferNetworkFee() {
  const endpoint = blockchainEndpoints.stellar.connection;
  const server = new StellarSdk.Server(endpoint);
  return await server.fetchBaseFee();
}

export async function transfer({ endpoint, sender, recipient, amount }) {
  try {
    // Derive Keypair object and public key (that starts with a G) from the secret
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sender.stellar.private);
    const sourcePublicKey = sourceKeypair.publicKey();
    
    const server = new StellarSdk.Server(endpoint.connection);
    
    return await makeTransaction(server, { endpoint, sender, recipient, amount, sourcePublicKey, sourceKeypair });
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

function isPrivateKeyValid(privateKey) {
  try {
    StellarSdk.Keypair.fromSecret(privateKey);
    return true;
  } catch {
    return false;
  }
}

function isPublicKeyValid(publicKey) {
  return StellarSdk.StrKey.isValidEd25519PublicKey(publicKey);
}

export function nativeFormat(amount) {
  return amount;
}

export function format(amount) {
  return amount;
}


export default {
      name: 'stellar',
      format,
      estimateTransferNetworkFee,
      nativeFormat,  
      getBalance,
      transfer,
      isPrivateKeyValid,
      isPublicKeyValid,
      getKeys,
      getConnection,
      getRandomKeys: createStellarWallet,
    }