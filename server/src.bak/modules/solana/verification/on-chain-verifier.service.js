/**
 * On-Chain Verifier Service
 *
 * Verifies attestations and provenance records against what is
 * actually stored on Solana. Any mismatch between the platform's
 * database and the on-chain account is flagged.
 *
 * @module server/modules/solana/verification/on-chain-verifier.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { connectionService } from '../config/connection.service';
import { programConfigService } from '../config/program-config.service';
import { pdaService } from '../programs/pda.service';

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module || !module.PublicKey) {
      throw new Error('PublicKey missing');
    }
    return module;
  } catch (err) {
    throw new AppError('Solana web3 library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
}

async function fetchAccountData({ accountAddress }) {
  if (!accountAddress) {
    throw new AppError('accountAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const web3 = await loadWeb3();
  const connection = await connectionService.getConnection();
  const publicKey = new web3.PublicKey(accountAddress);

  const info = await connection.getAccountInfo(publicKey, 'confirmed');

  if (!info) {
    return null;
  }

  return {
    address: accountAddress,
    owner: info.owner.toString(),
    data: info.data,
    dataLength: info.data.length,
    lamports: info.lamports,
    executable: info.executable,
  };
}

function compareHexHashes({ dbHash, chainHash }) {
  if (!dbHash || !chainHash) {
    return false;
  }
  return dbHash.toLowerCase() === chainHash.toLowerCase();
}

export async function verifyAttestation({ attestation }) {
  if (!attestation || !attestation.attestation_hash) {
    throw new AppError('attestation with attestation_hash is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let pda;

  try {
    const pdaResult = await pdaService.deriveAttestationPda({
      subjectType: attestation.subject_type,
      subjectId: attestation.subject_id,
      attestationType: attestation.attestation_type,
    });
    pda = pdaResult.pda;
  } catch (err) {
    logger.warn({ err, attestationId: attestation.id }, 'Attestation PDA derivation failed');
    return { verified: false, reason: 'PDA_DERIVATION_FAILED' };
  }

  const account = await fetchAccountData({ accountAddress: pda });

  if (!account) {
    return { verified: false, reason: 'ACCOUNT_NOT_FOUND', pda };
  }

  const expectedOwner = programConfigService.tryGetProgramId({ key: 'attestation' });

  if (expectedOwner && account.owner !== expectedOwner) {
    return { verified: false, reason: 'OWNER_MISMATCH', pda, owner: account.owner };
  }

  const dataString = account.data.toString('hex');

  const matches = dataString.includes(attestation.attestation_hash.toLowerCase());

  if (!matches) {
    return { verified: false, reason: 'HASH_NOT_FOUND_ON_CHAIN', pda };
  }

  return {
    verified: true,
    pda,
    accountOwner: account.owner,
    dataLength: account.dataLength,
  };
}

export async function verifyProvenance({ provenance }) {
  if (!provenance || !provenance.processing_hash) {
    throw new AppError('provenance with processing_hash is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let pda;

  try {
    const pdaResult = await pdaService.deriveProvenancePda({
      signalId: provenance.signal_id,
      aiVersion: provenance.ai_version,
    });
    pda = pdaResult.pda;
  } catch (err) {
    logger.warn({ err, provenanceId: provenance.id }, 'Provenance PDA derivation failed');
    return { verified: false, reason: 'PDA_DERIVATION_FAILED' };
  }

  const account = await fetchAccountData({ accountAddress: pda });

  if (!account) {
    return { verified: false, reason: 'ACCOUNT_NOT_FOUND', pda };
  }

  const expectedOwner = programConfigService.tryGetProgramId({ key: 'provenance' });

  if (expectedOwner && account.owner !== expectedOwner) {
    return { verified: false, reason: 'OWNER_MISMATCH', pda, owner: account.owner };
  }

  const dataString = account.data.toString('hex');
  const matches = dataString.includes(provenance.processing_hash.toLowerCase());

  if (!matches) {
    return { verified: false, reason: 'HASH_NOT_FOUND_ON_CHAIN', pda };
  }

  return {
    verified: true,
    pda,
    accountOwner: account.owner,
    dataLength: account.dataLength,
  };
}

export async function verifyTransactionIncluded({ txSignature, expectedSlot }) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await connectionService.getConnection();

  const tx = await connection.getTransaction(txSignature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    return { found: false };
  }

  return {
    found: true,
    slot: tx.slot,
    blockTime: tx.blockTime,
    err: tx.meta ? tx.meta.err : null,
    matchesExpectedSlot: expectedSlot ? tx.slot === expectedSlot : null,
  };
}

export const onChainVerifierService = {
  fetchAccountData,
  verifyAttestation,
  verifyProvenance,
  verifyTransactionIncluded,
  compareHexHashes,
};