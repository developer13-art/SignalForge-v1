/**
 * Payment Program Client
 *
 * Builds and submits transactions for the signalforge-payment Anchor
 * program. Handles payment creation, confirmation, and refund
 * instruction construction.
 *
 * @module server/modules/solana/programs/payment-program.client
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { programClientService } from './program-client.service';
import { pdaService } from './pda.service';
import { transactionSubmitterService } from '../transactions/transaction-submitter.service';

function buildDiscriminator(name) {
  return crypto.createHash('sha256').update(`global:${name}`).digest().subarray(0, 8);
}

function encodeCreatePaymentArgs({ amount, token, reference }) {
  const discriminator = buildDiscriminator('create_payment');
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(Math.floor(amount)));
  const tokenBuffer = Buffer.from(String(token).substring(0, 8), 'utf8');
  const referenceBuffer = Buffer.from(String(reference).substring(0, 64), 'utf8');

  const lengthPrefix = (buffer) => {
    const prefix = Buffer.alloc(4);
    prefix.writeUInt32LE(buffer.length, 0);
    return prefix;
  };

  return Buffer.concat([
    discriminator,
    amountBuffer,
    lengthPrefix(tokenBuffer),
    tokenBuffer,
    lengthPrefix(referenceBuffer),
    referenceBuffer,
  ]);
}

export async function buildCreatePaymentTransaction({
  authority,
  reference,
  amount,
  token,
  recipient,
}) {
  if (!authority || !reference || !amount || !token || !recipient) {
    throw new AppError(
      'authority, reference, amount, token, and recipient are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const pdaResult = await pdaService.derivePaymentPda({ reference });

  const { web3, connection } = await programClientService.getProgramContext({ programKey: 'payment' });

  const instruction = await programClientService.buildInstruction({
    programKey: 'payment',
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: true },
      { pubkey: pdaResult.pda, isSigner: false, isWritable: true },
    ],
    data: encodeCreatePaymentArgs({ amount, token, reference }),
  });

  const transaction = new web3.Transaction().add(instruction);

  const latest = await connection.getLatestBlockhash('confirmed');

  transaction.recentBlockhash = latest.blockhash;
  transaction.feePayer = new web3.PublicKey(authority);

  return {
    transaction,
    pda: pdaResult.pda,
    bump: pdaResult.bump,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  };
}

export async function createAndSubmitPayment(args) {
  const built = await buildCreatePaymentTransaction(args);

  const serialized = built.transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  const submission = await transactionSubmitterService.submitTransaction({
    serializedTransaction: serialized,
    purpose: 'PAYMENT_CREATE',
    referenceType: 'PAYMENT',
    referenceId: args.reference,
    userId: args.userId || null,
  });

  logger.info({ pda: built.pda, signature: submission.signature }, 'Payment transaction created');

  return { ...submission, pda: built.pda, bump: built.bump };
}

export const paymentProgramClient = {
  buildCreatePaymentTransaction,
  createAndSubmitPayment,
};