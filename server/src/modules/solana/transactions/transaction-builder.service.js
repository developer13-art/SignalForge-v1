/**
 * Transaction Builder Service
 *
 * Constructs Solana transactions from a specification. The concrete
 * web3.js library is loaded lazily so the platform can boot without
 * it in non-Solana environments.
 *
 * @module server/modules/solana/transactions/transaction-builder.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { connectionService } from '../config/connection.service';

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module || !module.Transaction || !module.PublicKey || !module.SystemProgram) {
      throw new Error('Required web3 exports missing');
    }
    return module;
  } catch (err) {
    throw new AppError(
      'Solana web3 library is not available',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
}

export async function buildSolTransferTransaction({ from, to, lamports }) {
  if (!from || !to || !lamports) {
    throw new AppError('from, to, and lamports are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const web3 = await loadWeb3();
  const connection = await connectionService.getConnection();

  const fromPubkey = new web3.PublicKey(from);
  const toPubkey = new web3.PublicKey(to);

  const transaction = new web3.Transaction();

  transaction.add(
    web3.SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    }),
  );

  const latest = await connection.getLatestBlockhash('confirmed');

  transaction.recentBlockhash = latest.blockhash;
  transaction.feePayer = fromPubkey;

  return {
    transaction,
    lastValidBlockHeight: latest.lastValidBlockHeight,
    blockhash: latest.blockhash,
  };
}

export async function buildMemoTransaction({ from, memo, extraInstructions = [] }) {
  if (!from || !memo) {
    throw new AppError('from and memo are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const web3 = await loadWeb3();
  const connection = await connectionService.getConnection();

  const fromPubkey = new web3.PublicKey(from);

  const transaction = new web3.Transaction();

  for (const instruction of extraInstructions) {
    transaction.add(instruction);
  }

  const MEMO_PROGRAM_ID = new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  transaction.add(
    new web3.TransactionInstruction({
      keys: [{ pubkey: fromPubkey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, 'utf8'),
    }),
  );

  const latest = await connection.getLatestBlockhash('confirmed');

  transaction.recentBlockhash = latest.blockhash;
  transaction.feePayer = fromPubkey;

  return {
    transaction,
    lastValidBlockHeight: latest.lastValidBlockHeight,
    blockhash: latest.blockhash,
  };
}

export async function serializeTransaction({ transaction, requiresAllSignatures = false }) {
  if (!transaction) {
    throw new AppError('transaction is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return transaction.serialize({
    requireAllSignatures: requiresAllSignatures,
    verifySignatures: false,
  });
}

export const transactionBuilderService = {
  buildSolTransferTransaction,
  buildMemoTransaction,
  serializeTransaction,
};