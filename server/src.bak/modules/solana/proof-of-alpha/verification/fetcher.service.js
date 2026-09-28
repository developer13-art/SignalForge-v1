'use strict';

const { Connection, PublicKey } = require('@solana/web3.js');

const fetcherRepository = require('./fetcher.repository');

const { config } = require('../proof.config');
const {
  PROOF_MEMO_PROGRAM_ID,
} = require('../proof.constants');

const {
  RpcUnavailableError,
  ProofNotFoundError,
} = require('../proof.errors');

/**
 * SignalForge - Fetcher Service
 *
 * Fetches transactions, signatures, and memo entries from the Solana
 * network. Results are cached in the fetcher repository so that a
 * burst of verification requests for the same signature does not
 * produce a burst of RPC calls.
 */

let cachedConnection = null;

const DEFAULT_TTL_SECONDS = 300;

function getConnection() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const endpoint =
    process.env.SOLANA_RPC_URL ||
    (String(config.network).includes('devnet')
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com');

  cachedConnection = new Connection(endpoint, config.commitment || 'confirmed');
  return cachedConnection;
}

function generateFetchId() {
  const crypto = require('crypto');
  return `fetch_${crypto.randomBytes(12).toString('hex')}`;
}

function extractMemosFromTransaction(transaction, memoProgramId) {
  if (!transaction) {
    return [];
  }

  const memos = [];

  const candidateProgramId = memoProgramId || PROOF_MEMO_PROGRAM_ID;

  const collectFromInstructions = (instructions, accountKeys) => {
    if (!Array.isArray(instructions)) {
      return;
    }

    for (const instruction of instructions) {
      const programId =
        instruction.programId && typeof instruction.programId.toBase58 === 'function'
          ? instruction.programId.toBase58()
          : instruction.programId;

      if (programId !== candidateProgramId) {
        continue;
      }

      if (instruction.parsed && typeof instruction.parsed === 'string') {
        memos.push(instruction.parsed);
      } else if (instruction.data) {
        try {
          const decoded = Buffer.from(instruction.data, 'base64').toString('utf8');
          memos.push(decoded);
        } catch (_error) {
          // Ignore unparseable data
        }
      }
    }

    void accountKeys;
  };

  if (transaction.transaction && transaction.transaction.message) {
    const message = transaction.transaction.message;
    if (Array.isArray(message.instructions)) {
      collectFromInstructions(message.instructions, message.accountKeys);
    } else if (message.compiledInstructions) {
      collectFromInstructions(message.compiledInstructions, message.staticAccountKeys);
    }
  }

  return memos;
}

function extractAuthorityFromTransaction(transaction) {
  if (!transaction || !transaction.transaction || !transaction.transaction.message) {
    return null;
  }
  const message = transaction.transaction.message;

  if (Array.isArray(message.accountKeys) && message.accountKeys.length > 0) {
    const first = message.accountKeys[0];
    return first && typeof first.toBase58 === 'function' ? first.toBase58() : String(first);
  }

  if (Array.isArray(message.staticAccountKeys) && message.staticAccountKeys.length > 0) {
    const first = message.staticAccountKeys[0];
    return first && typeof first.toBase58 === 'function' ? first.toBase58() : String(first);
  }

  return null;
}

function extractReferenceFromTransaction(transaction) {
  if (!transaction || !transaction.transaction || !transaction.transaction.message) {
    return null;
  }
  const message = transaction.transaction.message;
  const keys = Array.isArray(message.accountKeys)
    ? message.accountKeys
    : Array.isArray(message.staticAccountKeys)
    ? message.staticAccountKeys
    : [];

  for (let index = 1; index < keys.length; index += 1) {
    const key = keys[index];
    const address = key && typeof key.toBase58 === 'function' ? key.toBase58() : String(key);
    if (address && address !== '11111111111111111111111111111111') {
      return address;
    }
  }

  return null;
}

async function fetchSignatureStatus(signature) {
  const connection = getConnection();
  try {
    const response = await connection.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    return response && response.value ? response.value[0] : null;
  } catch (error) {
    throw new RpcUnavailableError('Failed to fetch signature status', {
      signature,
      reason: error.message,
    });
  }
}

async function fetchTransaction(signature) {
  const connection = getConnection();
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: config.commitment || 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    return transaction;
  } catch (error) {
    throw new RpcUnavailableError('Failed to fetch transaction', {
      signature,
      reason: error.message,
    });
  }
}

async function fetchParsed(signature, { ttlSeconds = DEFAULT_TTL_SECONDS, forceRefresh = false } = {}) {
  if (!signature) {
    throw new ProofNotFoundError('Signature is required to fetch a proof');
  }

  if (!forceRefresh) {
    const cached = await fetcherRepository.findFreshBySignature(signature, { ttlSeconds });
    if (cached) {
      return {
        signature,
        slot: cached.slot,
        blockTime: cached.block_time,
        confirmationStatus: cached.confirmation_status,
        memoText: cached.memo_text,
        authority: cached.authority,
        reference: cached.reference,
        err: cached.err,
        rawTransaction: cached.raw_transaction,
        cached: true,
      };
    }
  }

  const status = await fetchSignatureStatus(signature);

  const transaction = await fetchTransaction(signature);

  if (!transaction && !status) {
    throw new ProofNotFoundError('Transaction was not found on-chain', { signature });
  }

  const memos = extractMemosFromTransaction(transaction);
  const memoText = memos.length > 0 ? memos.join(' | ') : null;

  const authority = extractAuthorityFromTransaction(transaction);
  const reference = extractReferenceFromTransaction(transaction);

  const record = await fetcherRepository.createFetch(null, {
    id: generateFetchId(),
    signature,
    slot: status?.slot || transaction?.slot || null,
    blockTime: transaction?.blockTime || null,
    confirmationStatus: status?.confirmationStatus || null,
    memoText,
    authority,
    reference,
    err: status?.err || null,
    rawTransaction: transaction
      ? {
          slot: transaction.slot,
          blockTime: transaction.blockTime,
          meta: transaction.meta,
        }
      : null,
  });

  return {
    signature,
    slot: record.slot,
    blockTime: record.block_time,
    confirmationStatus: record.confirmation_status,
    memoText: record.memo_text,
    authority: record.authority,
    reference: record.reference,
    err: record.err,
    rawTransaction: record.raw_transaction,
    cached: false,
  };
}

async function fetchRaw(signature) {
  return fetchTransaction(signature);
}

async function signatureExists(signature) {
  const status = await fetchSignatureStatus(signature);
  return Boolean(status && !status.err);
}

async function getRecentSignaturesForAddress(address, { limit = 20, before } = {}) {
  const connection = getConnection();
  try {
    const publicKey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
      before,
    });
    return signatures;
  } catch (error) {
    throw new RpcUnavailableError('Failed to fetch signatures for address', {
      address,
      reason: error.message,
    });
  }
}

async function listFetchesForAuthority(authority, { limit = 50 } = {}) {
  return fetcherRepository.listByAuthority(authority, { limit });
}

async function cleanupOldFetches({ olderThanDays = 30 } = {}) {
  return fetcherRepository.deleteOldFetches({ olderThanDays });
}

function clearConnectionCache() {
  cachedConnection = null;
}

module.exports = {
  getConnection,
  fetchSignatureStatus,
  fetchTransaction,
  fetchParsed,
  fetchRaw,
  signatureExists,
  getRecentSignaturesForAddress,
  extractMemosFromTransaction,
  extractAuthorityFromTransaction,
  extractReferenceFromTransaction,
  listFetchesForAuthority,
  cleanupOldFetches,
  clearConnectionCache,
};