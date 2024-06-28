import bitcoin from "/components/blockchain/bitcoin/bitcoin.js"
import ethereum from "/components/blockchain/ethereum/ethereum.js"
import solana from "/components/blockchain/solana/solana.js"
import stellar from "/components/blockchain/stellar/stellar.js"
import tron from "/components/blockchain/tron/tron.js"

export function getEmailFromText(text) {
  const match= text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  if (match == null) return null;
  return match[0];
}

export function isEmail(text) {
  return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(text))
}


function isBitcoinKey(s) {
  return bitcoin.isPrivateKeyValid(s);
}

function isEthereumKey(s) {
  return ethereum.isPrivateKeyValid(s);
}

function isSolanaKey(s) {
  return solana.isPrivateKeyValid(s);
}

function isSolanaPublicKey(s) {
  return solana.isPublicKeyValid(s);
}

function isStellarKey(s) {
  return stellar.isPrivateKeyValid(s);
}

function isStellarPublicKey(s) {
  return stellar.isPublicKeyValid(s);
}

function isTronPrivateKey(s) {
  return tron.isPrivateKeyValid(s);
}

function isTronPublicKey(s) {
  return tron.isPublicKeyValid(s);
}

export default {
  getEmailFromText,
  isEmail,
  isBitcoinKey,
  isEthereumKey,
  isSolanaKey,
  isSolanaPublicKey,
  isStellarPublicKey,
  isStellarKey,
  isTronPrivateKey,
  isTronPublicKey
}