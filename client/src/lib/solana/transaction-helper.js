/**
 * Transaction Helper
 *
 * Convenience functions for submitting transactions from the browser
 * wallet. The helper always confirms the transaction before
 * returning.
 *
 * @module client/src/lib/solana/transaction-helper
 */

import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { solanaConnection } from './connection.js';

export async function sendAndConfirmTransaction({ connection, transaction, wallet }) {
  if (!transaction || !wallet) {
    throw new Error('transaction and wallet are required');
  }

  const conn = connection || solanaConnection.getConnection();

  const signature = await wallet.sendTransaction(transaction, conn);

  const latest = await conn.getLatestBlockhash('confirmed');
  await conn.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    'confirmed',
  );

  return signature;
}

export async function buildTransaction({ instructions, feePayer, recentBlockhash }) {
  const transaction = new Transaction();

  for (const instruction of instructions) {
    transaction.add(instruction);
  }

  if (feePayer) {
    transaction.feePayer = feePayer;
  }

  if (recentBlockhash) {
    transaction.recentBlockhash = recentBlockhash;
  }

  return transaction;
}

export const transactionHelper = {
  sendAndConfirmTransaction,
  buildTransaction,
};

export default transactionHelper;