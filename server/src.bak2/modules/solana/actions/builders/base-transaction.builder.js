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

const {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');

const tokenResolver = require('./token-resolver.service');
const treasuryResolver = require('./treasury-resolver.service');
const referenceKeyService = require('./reference-key.service');
const transactionSerializer = require('./transaction-serializer.service');

const { config } = require('../actions.config');
const {
  TransactionBuildError,
  ServiceUnavailableError,
} = require('../actions.errors');

/**
 * SignalForge - Base Transaction Builder
 *
 * Provides the shared building blocks for every Blink transaction:
 * priority fee, compute budget, memo instruction, reference account,
 * and both SPL token and native SOL transfer paths. Concrete builders
 * extend this with their own business logic.
 */

const DEFAULT_COMPUTE_UNITS = 200000;
const DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS = 50000;

function getConnection() {
  return tokenResolver.getConnection();
}

function resolvePriorityFeeMicroLamports() {
  const raw = process.env.SOLANA_ACTIONS_PRIORITY_FEE_MICRO_LAMPORTS;
  if (!raw) {
    return DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS;
  }
  return parsed;
}

function resolveComputeUnits() {
  const raw = process.env.SOLANA_ACTIONS_COMPUTE_UNITS;
  if (!raw) {
    return DEFAULT_COMPUTE_UNITS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 21000) {
    return DEFAULT_COMPUTE_UNITS;
  }
  return parsed;
}

function buildComputeBudgetInstructions() {
  return [
    ComputeBudgetProgram.setComputeUnitLimit({
      units: resolveComputeUnits(),
    }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: resolvePriorityFeeMicroLamports(),
    }),
  ];
}

function buildMemoInstruction(memoText, signerPublicKey) {
  return new TransactionInstruction({
    keys: [{ pubkey: signerPublicKey, isSigner: true, isWritable: false }],
    programId: new PublicKey(referenceKeyService.getMemoProgramId()),
    data: Buffer.from(memoText, 'utf8'),
  });
}

function buildReferenceInstruction(referencePublicKey, signerPublicKey) {
  return new TransactionInstruction({
    keys: [
      { pubkey: referencePublicKey, isSigner: false, isWritable: false },
      { pubkey: signerPublicKey, isSigner: true, isWritable: false },
    ],
    programId: SystemProgram.programId,
    data: Buffer.alloc(0),
  });
}

async function buildSplTransferInstructions({
  connection,
  payer,
  sourceOwner,
  destinationOwner,
  mintAddress,
  amountBaseUnits,
}) {
  const mint = new PublicKey(mintAddress);
  const sourceAta = await getAssociatedTokenAddress(
    mint,
    sourceOwner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const destinationAta = await getAssociatedTokenAddress(
    mint,
    destinationOwner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const instructions = [];

  const destinationInfo = await connection.getAccountInfo(destinationAta);
  if (!destinationInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        destinationAta,
        destinationOwner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  instructions.push(
    createTransferInstruction(
      sourceAta,
      destinationAta,
      sourceOwner,
      BigInt(amountBaseUnits),
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  return { instructions, sourceAta, destinationAta };
}

function buildSolTransferInstruction({ sourceOwner, destinationOwner, lamports }) {
  return SystemProgram.transfer({
    fromPubkey: sourceOwner,
    toPubkey: destinationOwner,
    lamports: Number(lamports),
  });
}

async function getLatestBlockhashSafe() {
  const connection = getConnection();
  const result = await connection.getLatestBlockhash(config.commitment || 'confirmed');
  if (!result || !result.blockhash) {
    throw new ServiceUnavailableError('Failed to fetch latest blockhash');
  }
  return result;
}

function buildVersionedTransaction({ payer, instructions, blockhash }) {
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

async function buildTransferTransaction({
  blink,
  wallet,
  token,
  memo,
  reference,
  destination,
  amountBaseUnits,
}) {
  const connection = getConnection();

  let payer;
  let destinationOwner;
  try {
    payer = new PublicKey(wallet);
    destinationOwner = destination || treasuryResolver.resolveTreasury();
  } catch (error) {
    throw new TransactionBuildError('Failed to derive payer or treasury public key', {
      reason: error.message,
    });
  }

  const { blockhash } = await getLatestBlockhashSafe();
  const referencePublicKey = reference
    ? referenceKeyService.toPublicKey(reference)
    : undefined;

  const instructions = [...buildComputeBudgetInstructions()];

  const memoText = memo || referenceKeyService.buildReferenceMemo({
    blinkId: blink.id,
    templateType: blink.template_type,
    wallet,
    planId: blink.plan_id,
    referralCode: blink.referral_code,
    providerId: blink.provider_id,
    amount: blink.amount,
    token: token.symbol,
  });

  instructions.push(buildMemoInstruction(memoText, payer));

  if (referencePublicKey) {
    instructions.push(buildReferenceInstruction(referencePublicKey, payer));
  }

  const isNativeSol = token.symbol === 'SOL';

  if (isNativeSol) {
    instructions.push(
      buildSolTransferInstruction({
        sourceOwner: payer,
        destinationOwner,
        lamports: amountBaseUnits,
      }),
    );
  } else {
    const { instructions: splInstructions } = await buildSplTransferInstructions({
      connection,
      payer,
      sourceOwner: payer,
      destinationOwner,
      mintAddress: token.mint,
      amountBaseUnits,
    });
    instructions.push(...splInstructions);
  }

  const transaction = buildVersionedTransaction({
    payer,
    instructions,
    blockhash,
  });

  return transaction;
}

async function buildAndSerialize(params) {
  const transaction = await buildTransferTransaction(params);
  const serialized = transactionSerializer.serializeTransaction(transaction, {
    requireAllSignatures: false,
  });

  return {
    transaction,
    serialized,
  };
}

async function fetchMintDecimals(mintAddress) {
  const connection = getConnection();
  const mintPublicKey = new PublicKey(mintAddress);
  const mintInfo = await getMint(connection, mintPublicKey, config.commitment || 'confirmed', TOKEN_PROGRAM_ID);
  return mintInfo.decimals;
}

module.exports = {
  getConnection,
  buildComputeBudgetInstructions,
  buildMemoInstruction,
  buildReferenceInstruction,
  buildSplTransferInstructions,
  buildSolTransferInstruction,
  buildVersionedTransaction,
  buildTransferTransaction,
  buildAndSerialize,
  fetchMintDecimals,
  resolvePriorityFeeMicroLamports,
  resolveComputeUnits,
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
};