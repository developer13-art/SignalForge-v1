'use strict';

const fs = require('fs');
const path = require('path');

const { Keypair, PublicKey } = require('@solana/web3.js');

const { config } = require('../proof.config');
const { SignerUnavailableError } = require('../proof.errors');

/**
 * SignalForge - Memo Signer Service
 *
 * Owns the single backend authority keypair used to sign every Proof
 * of Alpha memo transaction. The keypair is loaded once and cached in
 * memory. The service never exposes the secret key outside this module.
 */

let cachedKeypair = null;

function parseKeypairJson(json) {
  const parsed = Array.isArray(json) ? json : JSON.parse(json);
  const secretKey = Uint8Array.from(parsed);
  return Keypair.fromSecretKey(secretKey);
}

function loadKeypairFromPath(keypairPath) {
  const resolvedPath = path.isAbsolute(keypairPath)
    ? keypairPath
    : path.resolve(process.cwd(), keypairPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new SignerUnavailableError('Proof of Alpha keypair file was not found', {
      path: resolvedPath,
    });
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');

  try {
    return parseKeypairJson(raw);
  } catch (error) {
    throw new SignerUnavailableError('Proof of Alpha keypair file is invalid', {
      path: resolvedPath,
      reason: error.message,
    });
  }
}

function loadKeypairFromJson(keypairJson) {
  try {
    return parseKeypairJson(keypairJson);
  } catch (error) {
    throw new SignerUnavailableError('Proof of Alpha keypair JSON is invalid', {
      reason: error.message,
    });
  }
}

function loadKeypair() {
  if (cachedKeypair) {
    return cachedKeypair;
  }

  const { keypairPath, keypairJson } = config.authority;

  if (keypairJson) {
    cachedKeypair = loadKeypairFromJson(keypairJson);
    return cachedKeypair;
  }

  if (keypairPath) {
    cachedKeypair = loadKeypairFromPath(keypairPath);
    return cachedKeypair;
  }

  throw new SignerUnavailableError(
    'No Proof of Alpha keypair has been configured',
    { hint: 'Set PROOF_OF_ALPHA_KEYPAIR_PATH or PROOF_OF_ALPHA_KEYPAIR_JSON' },
  );
}

function getPublicKey() {
  const keypair = loadKeypair();
  return keypair.publicKey;
}

function getPublicKeyString() {
  return getPublicKey().toBase58();
}

function getPublicKeyOrConfigured() {
  const configured = config.authority.publicKey;
  if (configured) {
    try {
      return new PublicKey(configured);
    } catch (_error) {
      // Fall through to keypair-based resolution.
    }
  }
  return getPublicKey();
}

function signTransaction(transaction) {
  const keypair = loadKeypair();

  if (typeof transaction.partialSign === 'function') {
    transaction.partialSign(keypair);
    return transaction;
  }

  if (transaction.signatures && Array.isArray(transaction.signatures)) {
    transaction.sign([keypair]);
    return transaction;
  }

  if (typeof transaction.sign === 'function') {
    transaction.sign([keypair]);
    return transaction;
  }

  throw new SignerUnavailableError('Unable to sign the provided transaction');
}

function clearCache() {
  cachedKeypair = null;
}

function isConfigured() {
  return Boolean(config.authority.keypairPath || config.authority.keypairJson);
}

module.exports = {
  loadKeypair,
  getPublicKey,
  getPublicKeyString,
  getPublicKeyOrConfigured,
  signTransaction,
  isConfigured,
  clearCache,
};