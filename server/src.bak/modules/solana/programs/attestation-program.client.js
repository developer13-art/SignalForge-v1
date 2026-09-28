/**
 * Attestation Program Client
 *
 * Builds and submits transactions for the signalforge-attestation
 * Anchor program. Handles create, update, and revoke instruction
 * construction along with the corresponding PDA derivation.
 *
 * @module server/modules/solana/programs/attestation-program.client
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

function encodeAttestationArgs({ attestationHash, subjectType, subjectId, attestationType }) {
  const discriminator = buildDiscriminator('create_attestation');

  const hashBuffer = Buffer.from(attestationHash, 'hex');
  const subjectTypeBuffer = Buffer.from(subjectType, 'utf8');
  const subjectIdBuffer = Buffer.from(subjectId, 'utf8');
  const attestationTypeBuffer = Buffer.from(attestationType, 'utf8');

  const lengthPrefix = (buffer) => {
    const prefix = Buffer.alloc(4);
    prefix.writeUInt32LE(buffer.length, 0);
    return prefix;
  };

  return Buffer.concat([
    discriminator,
    hashBuffer,
    lengthPrefix(subjectTypeBuffer),
    subjectTypeBuffer,
    lengthPrefix(subjectIdBuffer),
    subjectIdBuffer,
    lengthPrefix(attestationTypeBuffer),
    attestationTypeBuffer,
  ]);
}

async function buildCreateAttestationInstruction({
  authority,
  attestationHash,
  subjectType,
  subjectId,
  attestationType,
  pda,
}) {
  const instruction = await programClientService.buildInstruction({
    programKey: 'attestation',
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
    ],
    data: encodeAttestationArgs({ attestationHash, subjectType, subjectId, attestationType }),
  });

  return instruction;
}

export async function createAttestationTransaction({
  authority,
  subjectType,
  subjectId,
  attestationType,
  attestationHash,
}) {
  if (!authority || !subjectType || !subjectId || !attestationType || !attestationHash) {
    throw new AppError(
      'authority, subjectType, subjectId, attestationType, and attestationHash are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  if (!/^[a-f0-9]{64}$/i.test(attestationHash)) {
    throw new AppError('attestationHash must be a 64-character hex string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const pdaResult = await pdaService.deriveAttestationPda({
    subjectType,
    subjectId,
    attestationType,
  });

  const { web3, connection } = await programClientService.getProgramContext({ programKey: 'attestation' });

  const instruction = await buildCreateAttestationInstruction({
    authority,
    attestationHash,
    subjectType,
    subjectId,
    attestationType,
    pda: pdaResult.pda,
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

export async function submitAttestationTransaction({
  serializedTransaction,
  referenceType,
  referenceId,
  userId,
}) {
  return transactionSubmitterService.submitTransaction({
    serializedTransaction,
    purpose: 'ATTESTATION_CREATE',
    referenceType,
    referenceId,
    userId,
  });
}

export async function createAndSubmitAttestation(args) {
  const built = await createAttestationTransaction(args);

  const serialized = await programClientService.getProgramContext({ programKey: 'attestation' }).then(({ web3 }) => built.transaction.serialize({ requireAllSignatures: false, verifySignatures: false }));

  const submission = await submitAttestationTransaction({
    serializedTransaction: serialized,
    referenceType: args.subjectType,
    referenceId: args.subjectId,
    userId: args.userId || null,
  });

  logger.info({ pda: built.pda, signature: submission.signature }, 'Attestation transaction created');

  return { ...submission, pda: built.pda, bump: built.bump };
}

export const attestationProgramClient = {
  createAttestationTransaction,
  submitAttestationTransaction,
  createAndSubmitAttestation,
};