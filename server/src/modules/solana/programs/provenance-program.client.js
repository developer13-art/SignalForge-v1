/**
 * Provenance Program Client
 *
 * Builds and submits transactions for the signalforge-provenance
 * Anchor program. Anchors a processing hash for a signal together
 * with the AI version and other public-safe metadata.
 *
 * @module server/modules/solana/programs/provenance-program.client
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

function encodeProvenanceArgs({ processingHash, aiVersion, signalId }) {
  const discriminator = buildDiscriminator('anchor_provenance');

  const hashBuffer = Buffer.from(processingHash, 'hex');
  const aiVersionBuffer = Buffer.from(String(aiVersion).substring(0, 32), 'utf8');
  const signalIdBuffer = Buffer.from(signalId, 'utf8');

  const lengthPrefix = (buffer) => {
    const prefix = Buffer.alloc(4);
    prefix.writeUInt32LE(buffer.length, 0);
    return prefix;
  };

  return Buffer.concat([
    discriminator,
    hashBuffer,
    lengthPrefix(aiVersionBuffer),
    aiVersionBuffer,
    lengthPrefix(signalIdBuffer),
    signalIdBuffer,
  ]);
}

export async function buildAnchorProvenanceTransaction({
  authority,
  signalId,
  processingHash,
  aiVersion,
}) {
  if (!authority || !signalId || !processingHash || !aiVersion) {
    throw new AppError(
      'authority, signalId, processingHash, and aiVersion are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  if (!/^[a-f0-9]{64}$/i.test(processingHash)) {
    throw new AppError('processingHash must be a 64-character hex string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const pdaResult = await pdaService.deriveProvenancePda({ signalId, aiVersion });

  const { web3, connection } = await programClientService.getProgramContext({ programKey: 'provenance' });

  const instruction = await programClientService.buildInstruction({
    programKey: 'provenance',
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: pdaResult.pda, isSigner: false, isWritable: true },
    ],
    data: encodeProvenanceArgs({ processingHash, aiVersion, signalId }),
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

export async function createAndSubmitProvenance(args) {
  const built = await buildAnchorProvenanceTransaction(args);

  const { web3 } = await programClientService.getProgramContext({ programKey: 'provenance' });

  const serialized = built.transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  const submission = await transactionSubmitterService.submitTransaction({
    serializedTransaction: serialized,
    purpose: 'PROVENANCE_ANCHOR',
    referenceType: 'SIGNAL',
    referenceId: args.signalId,
    userId: args.userId || null,
  });

  logger.info({ pda: built.pda, signature: submission.signature }, 'Provenance transaction created');

  return { ...submission, pda: built.pda, bump: built.bump };
}

export const provenanceProgramClient = {
  buildAnchorProvenanceTransaction,
  createAndSubmitProvenance,
};