import solana from "/components/blockchain/solana/solana.js";
import erc20   from "/components/blockchain/ethereum/erc20.js";
import trc20   from "/components/blockchain/tron/trc20.js";
import bitcoin from "/components/blockchain/bitcoin/bitcoin.js";
import ethereum from "/components/blockchain/ethereum/ethereum.js";
import tron from "/components/blockchain/tron/tron.js";
import stellar from "/components/blockchain/stellar/stellar.js";
import klaytnHistory from "/components/blockchain/history/klaytn.js";
import ethereumHistory from "/components/blockchain/history/ethereum.js";
import solanaHistory from "/components/blockchain/history/solana.js";
import stellarHistory from "/components/blockchain/history/stellar.js";
import bitcointHistory from "/components/blockchain/history/bitcoin.js";
import localHistory from "/components/blockchain/history/local.js";
import transak from  "/components/blockchain/providers/transak.js";

const isStorageDebug = true;
const isDebug = window.location.hostname == 'localhost';
// export const isTest = true;
export const isTest = (window.location.hostname != 'app.speakease.co') && (window.location.hostname != 'app-mainnets.speakease.co');

const prodStorage = { origin: 'node.int-t.com', port: 10010 };
const localStorage = { origin: 'localhost', port: 10010 };

const node = isStorageDebug ? localStorage : prodStorage;

export const blockchainEndpointsConfig = {
  testnets: {
    klaytn: {
      name: "Klaytn Baobab",
      node: 'https://node-api.klaytnapi.com/v1/klaytn',      
      options: {
        headers: [
          { name: "Authorization", value: "Basic S0FTSzBBSjlRVEpUWjlFM042NjFVQ0xUOnVyMlZrRWVLWURpS1hWYmJ4T2VKT2J6MnBsc1ZVUGc4YTJ2LWpSaEk=" },
          { name: "x-chain-id", "value": 1001 }
      ]},      
      historyProviderUrl: 'https://history.speakease.co/baobab',
      history: klaytnHistory,
      family: 'ethereum',
      module: ethereum,
    },
    solana: {
      name: "Solana Testnet",
      node: 'https://api.testnet.solana.com',
      family: 'solana',                
      history: solanaHistory,
      module: solana
    },
    binance: {
      name: "Binance Testnet",
      node: 'https://bsc-testnet.public.blastapi.io',
      family: 'ethereum',
      history: localHistory,
      module: ethereum
    },
    bitcoin: {
      name: "Bitcoin Testnet",
      node: 'https://btcbook-testnet.nownodes.io',
      options: {
        headers: {
          "api-key": "01827d36-9438-41d3-a028-97c69149a110"
        }
      },                        
      networkCode: 'testnet',
      history: bitcointHistory,
      family: 'bitcoin',
      network: window.bitcoin.networks.testnet,
      module: bitcoin,
    },
    ethereum: {
      name: "Ethereum Sepolia Testnet",
      node: 'https://eth-sepolia.g.alchemy.com/v2/P87c4KKNzOp6fkHKRmWybmm3MN3016cl',      
      historyProviderUrl: 'https://sepolia-api-v2.ethvm.dev/',
      history: ethereumHistory,
      family: 'ethereum',
      module: ethereum
    },
    polygon: {
      name: "Polygon Mumbai Testnet",
      node: 'https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78',      
      history: localHistory,
      family: 'ethereum',
      module: ethereum    
    },
    stellar: {
      name: "Stellar Testnet",
      node: 'https://horizon-testnet.stellar.org',      
      family: 'stellar',
      history: stellarHistory,
      networkCode: 'testnet',
      module: stellar,
    },
    tron: {
      name: "Tron Testnet",
      node: 'https://nile.trongrid.io/',
      family: 'tron',
      history: localHistory,      
      module: tron,
      key: '8e684007-fd44-4009-8e8e-5dea458ea0c6'
    }
  },
  mainnets: {
    klaytn: {
      name: "Klaytn Cypress",
      node: 'https://klay.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',      
      historyProviderUrl: 'https://history.speakease.co/cypress',      
      history: klaytnHistory,
      module: ethereum
    },
    solana: {
      name: "Solana Mainnet Beta",
      node: 'https://sol.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',                  
      history: solanaHistory,
      module: solana      
    },
    binance: {
      name: "Binance Mainnet",
      node: 'https://bsc.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',      
      history: localHistory,
      module: ethereum
    },
    bitcoin: {
      name: "Bitcoin Mainnet",
      node: 'https://btc.nownodes.io',
      options: {
        headers: {
          "api-key": "01827d36-9438-41d3-a028-97c69149a110"
        }        
      },      
      networkCode: 'mainnet',
      network: window.bitcoin.networks.bitcoin,
      history: bitcointHistory,
      module: bitcoin
    },
    ethereum: {
      name: "Ethereum Mainnet",
      node: 'https://eth.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',                        
      historyProviderUrl: 'https://api-v2.ethvm.dev/',
      history: ethereumHistory,      
      module: ethereum
    },
    polygon: {
      name: "Polygon Mainnet",
      node: 'https://matic.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',            
      history: localHistory,
      module: ethereum      
    },
    stellar: {
      name: "Stellar Mainnet",
      node: 'https://horizon.stellar.org',      
      networkCode: 'mainnet',  
      history: stellarHistory,    
      module: stellar      
    },
    tron: {
      name: "Tron Mainnet",
      node: 'https://trx.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',
      family: 'tron',
      history: localHistory,      
      module: tron,
      key: '8e684007-fd44-4009-8e8e-5dea458ea0c6'
    }
  },
  known: {
    "Ethereum Goerli": {
      name: "Ethereum Goerli",
      node: 'https://eth-goerli.nownodes.io/01827d36-9438-41d3-a028-97c69149a110',
      img: "/components/cryptoicons/eth.svg",
      history: localHistory,
      module: ethereum
    }
  }
};

export const blockchainEndpoints = isTest ? blockchainEndpointsConfig.testnets : blockchainEndpointsConfig.mainnets;

function getConnections() {
  for (const branchKey in blockchainEndpointsConfig) {    
    const branch = blockchainEndpointsConfig[branchKey];
    for (const endpsKey in branch) {
      const endps = branch[endpsKey];
      endps.key = endpsKey;
      endps.connection = endps.module.getConnection(endps);    
    }      
  }
}

getConnections();

export const currencies = {
  KLAY: {      
    img: "/components/cryptoicons/klay.svg",
    currency: 'KLAY',        
    blockchains: {
      klaytn: {
        transferFee: isTest ? 0.01 : 0.02,
        ...blockchainEndpoints.klaytn
      }
    }
   },
  SOL: {        
    img: "/components/cryptoicons/sol.svg",
    currency: 'SOL',
    blockchains: {
      solana: {
        transferFee: isTest ? 0.01 : 0.02,
        ...blockchainEndpoints.solana
      }
    }
  },
  BNB: {        
    img: "/components/cryptoicons/bnb.svg",
    currency: 'BNB',    
    blockchains: {
      binance: {
        transferFee: isTest ? 0.01 : 0.02,
        ...blockchainEndpoints.binance
      }
    }
  },
  BTC: {            
    img: "/components/cryptoicons/btc.svg",
    currency: 'BTC',
    blockchains: {
      bitcoin: {
        transferFee: isTest ? 0.01 : 0.02,
        ...blockchainEndpoints.bitcoin
      }
    }
  },
  ETH: {        
    img: "/components/cryptoicons/eth.svg",
    currency: 'ETH',
    transferFee: 0.01,
    blockchains: {
     ethereum: {
        transferFee: isTest ? 0.01 : 0.02,
        ...blockchainEndpoints.ethereum
      }
    }
  },
  XLM: {        
    img: "/components/cryptoicons/xlm.svg",
    currency: 'XLM',
    transferFee: 0.01,
    blockchains: {
     stellar: {
        transferFee: isTest ? 0.01 : 0.02,
        ...blockchainEndpoints.stellar
      }
    }
  },
  MATIC: {    
    img: "/components/cryptoicons/matic.svg",
    currency: 'MATIC',
    transferFee: 0.01,
    blockchains: {
      polygon: {
         transferFee: isTest ? 0.01 : 0.02,
         ...blockchainEndpoints.polygon
       }
     }
  },
  TRX: {    
    img: "/components/cryptoicons/trx.svg",
    currency: 'TRX',
    transferFee: 0.01,
    blockchains: {
      tron: {
         transferFee: isTest ? 0.01 : 0.02,
         ...blockchainEndpoints.tron
       }
     }
  },
  USDT: {
    img: "/components/cryptoicons/usdt.svg",
    currency: 'USDT',    
    blockchains: {      
      ethereum: { 
        transferFee: isTest ? 0.01 : 0.02, 
        contract: isTest ? erc20.getContract(blockchainEndpoints.ethereum, '0xcF10538a02d40d42dF13dF80228FE755eeB8D8f9') : 
                           erc20.getContract(blockchainEndpoints.ethereum, '0xdAC17F958D2ee523a2206206994597C13D831ec7'), 
        ...blockchainEndpoints.ethereum, 
        module: erc20
      },
      polygon: { 
        transferFee: isTest ? 0.01 : 0.02, 
        contract: isTest ? erc20.getContract(blockchainEndpoints.polygon, '0xb9C9E36A3B67BD6f06B43B354667b9eA2b73E3c1') : 
                           erc20.getContract(blockchainEndpoints.polygon, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'),
        ...blockchainEndpoints.polygon, 
        module: erc20
      },
      tron: { 
        transferFee: isTest ? 0.01 : 0.02, 
        contract: isTest ? 'TTX1xZhZZ9ZhCFhdd2gRTErk9a2eeucBgD' : 
                           'TU1ntBzpGPp7GJkzxLTKwYsneJ9JKUmBCK',
        ...blockchainEndpoints.tron, 
        module: trc20
      },
    }      
  },
  USDC: {
    img: "/components/cryptoicons/usdc.svg",
    currency: 'USDC',
    blockchains: {      
      tron: { 
        transferFee: isTest ? 0.01 : 0.02, 
        contract: isTest ? 'TTX1xZhZZ9ZhCFhdd2gRTErk9a2eeucBgD' : 
                           'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        ...blockchainEndpoints.tron, 
        module: trc20
      },
    }      
  },
  EURT: {    
    img: "/components/cryptoicons/eur.svg",
    currency: 'EURT',    
    blockchains: {
      ethereum: { 
        name: "EURT", 
        transferFee: isTest ? 0.01 : 0.02, 
        contract: isTest ? erc20.getContract(blockchainEndpoints.ethereum, '0x5cf86AF0fDD2389406cAe1c9311A5A914A5AceDc') :
                           erc20.getContract(blockchainEndpoints.ethereum, '0xC581b735A1688071A1746c968e0798D642EDE491'),
        ...blockchainEndpoints.ethereum, 
        module: erc20
      },
      polygon: { 
        name: "EURT", 
        transferFee: isTest ? 0.01 : 0.02, 
        contract: isTest ? erc20.getContract(blockchainEndpoints.polygon, '0x8Cec190aFFcbb0B0586F2E400D636b0F4F19994d') : 
                           erc20.getContract(blockchainEndpoints.polygon, '0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f'),
        ...blockchainEndpoints.polygon, 
        module: erc20        
      }
    }
  } 
}

export const providers = {
  transak: {
    name: 'Transak',
    key: 'transak',
    environment: isTest ? 'STAGING' : 'PRODUCTION',
    transakPartnerApiKey: isTest ? '6d220fef-c796-4f33-a565-a627a0d5e122' : '8de4b765-8d95-490e-a496-6116e6703922',
    module: transak
  },
}

const config = {
  loadingTimeout: 30000,
  usePaidRecognizer: false,
  isDebug,
  isTest,
  blockchainEndpoints: blockchainEndpoints,
  currencies,
  blockchainEndpointsConfig,
  recognitionBackend: 'https://recognition.speakease.co',
  node,
  ratesProvider: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cbitcoin%2Csolana%2Cklay-token%2Cbinancecoin%2Ctether%2Ctether-eurt&vs_currencies=usd&include_24hr_change=true',
  maxTryVoiceSignIn: 5,
  maxTryPasswordSignIn: 5,
  maxTryTimeLimit: 3600000,
  providers
}

export default config;
