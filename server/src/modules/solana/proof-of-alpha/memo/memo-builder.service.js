'use strict';

const {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  ComputeBudgetProgram,
} = require('@solana/web3.js');

const memoPayloadService = require('./memo-payload.service');
const memoSigner = require('./memo-signer.service');
const transactionSerializer = require('../../actions/builders/transaction-serializer.service');

const { config } = require('../proof.config');
const {
  PROOF_MEMO_PROGRAM_ID,
  PROOF_MAX_MEMO_BYTES,
} = require('../proof.constants');

const {
  InvalidMemoError,
  MemoTooLargeError,
  RpcUnavailableError,
} = require('../proof.errors');

/**
 * SignalForge - Memo Builder Service
 *
 * Constructs the Solana transaction that carries a Proof of Alpha
 * memo. The memo program is used as-is; no custom program is required
 * for writing proofs. Priority fee and compute units are configurable
 * so that operators can tune throughput versus cost.
 */

let cachedConnection = null;

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

function getMemoProgramId() {
  return new PublicKey(config.memo.programId || PROOF_MEMO_PROGRAM_ID);
}

function buildMemoInstruction(memoString, signerPublicKey) {
  const bytes = Buffer.from(memoString, 'utf8');

  if (bytes.length > PROOF_MAX_MEMO_BYTES) {
    throw new MemoTooLargeError(
      `Memo string exceeds the maximum allowed size of ${PROOF_MAX_MEMO_BYTES} bytes`,
      { bytes: bytes.length, max: PROOF_MAX_MEMO_BYTES },
    );
  }

  return new TransactionInstruction({
    keys: [{ pubkey: signerPublicKey, isSigner: true, isWritable: false }],
    programId: getMemoProgramId(),
    data: bytes,
  });
}

function buildComputeBudgetInstructions() {
  return [
    ComputeBudgetProgram.setComputeUnitLimit({
      units: config.priorityFee.computeUnits || 200000,
    }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: config.priorityFee.microLamports || 50000,
    }),
  ];
}

async function getLatestBlockhashSafe() {
  const connection = getConnection();
  try {
    const result = await connection.getLatestBlockhash(config.commitment || 'confirmed');
    if (!result || !result.blockhash) {
      throw new Error('Empty blockhash response');
    }
    return result;
  } catch (error) {
    throw new RpcUnavailableError('Failed to fetch latest blockhash', {
      reason: error.message,
    });
  }
}

function compileTransaction({ payer, instructions, blockhash }) {
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

async function buildMemoTransaction({ memoString, signer }) {
  if (!memoString || typeof memoString !== 'string') {
    throw new InvalidMemoError('Memo string is required');
  }

  const bytes = Buffer.from(memoString, 'utf8');
  if (bytes.length > PROOF_MAX_MEMO_BYTES) {
    throw new MemoTooLargeError(
      `Memo string exceeds the maximum allowed size of ${PROOF_MAX_MEMO_BYTES} bytes`,
      { bytes: bytes.length, max: PROOF_MAX_MEMO_BYTES },
    );
  }

  const signerKeypair = signer || memoSigner.loadKeypair();
  const payer = signerKeypair.publicKey;

  const { blockhash } = await getLatestBlockhashSafe();

  const instructions = [
    ...buildComputeBudgetInstructions(),
    buildMemoInstruction(memoString, payer),
  ];

  const transaction = compileTransaction({
    payer,
    instructions,
    blockhash,
  });

  return {
    transaction,
    signer: signerKeypair,
    memoString,
    memoBytes: bytes.length,
    blockhash,
  };
}

async function buildAndSignMemoTransaction({ memoString }) {
  const built = await buildMemoTransaction({ memoString });
  const signed = memoSigner.signTransaction(built.transaction);
  const serialized = transactionSerializer.serializeTransaction(signed, {
    requireAllSignatures: false,
  });

  return {
    ...built,
    signedTransaction: signed,
    serialized,
  };
}

function buildTradeCloseMemo({
  providerId,
  tradeId,
  symbol,
  direction,
  pnlUsd,
  pnlPercent,
  openedAt,
  closedAt,
  confidence,
  signalId,
}) {
  const payload = memoPayloadService.buildTradeClosePayload({
    providerId,
    tradeId,
    symbol,
    direction,
    pnlUsd,
    pnlPercent,
    openedAt,
    closedAt,
    confidence,
    signalId,
  });

  const memoString = memoPayloadService.buildMemoString(payload);
  const memoHash = memoPayloadService.hashPayload(payload);

  return { payload, memoString, memoHash };
}

function buildCertificationMemo({ providerId, qualityScore }) {
  const payload = memoPayloadService.buildCertificationPayload({
    providerId,
    qualityScore,
  });

  const memoString = memoPayloadService.buildMemoString(payload);
  const memoHash = memoPayloadService.hashPayload(payload);

  return { payload, memoString, memoHash };
}

function buildMilestoneMemo({ providerId, milestoneKey }) {
  const payload = memoPayloadService.buildMilestonePayload({
    providerId,
    milestoneKey,
  });

  const memoString = memoPayloadService.buildMemoString(payload);
  const memoHash = memoPayloadService.hashPayload(payload);

  return { payload, memoString, memoHash };
}

function buildPerformanceMemo({ providerId, periodStart, periodEnd }) {
  const payload = memoPayloadService.buildPerformancePayload({
    providerId,
    periodStart,
    periodEnd,
  });

  const memoString = memoPayloadService.buildMemoString(payload);
  const memoHash = memoPayloadService.hashPayload(payload);

  return { payload, memoString, memoHash };
}

function clearConnectionCache() {
  cachedConnection = null;
}

module.exports = {
  getConnection,
  getMemoProgramId,
  buildMemoInstruction,
  buildComputeBudgetInstructions,
  getLatestBlockhashSafe,
  compileTransaction,
  buildMemoTransaction,
  buildAndSignMemoTransaction,
  buildTradeCloseMemo,
  buildCertificationMemo,
  buildMilestoneMemo,
  buildPerformanceMemo,
  clearConnectionCache,
};