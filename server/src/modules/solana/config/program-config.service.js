/**
 * Program Config Service
 *
 * Resolves the Solana program IDs for each of the platform's on-chain
 * programs (attestation, provenance, payment) from the platform
 * config module. Missing program IDs cause an explicit error rather
 * than silent failures.
 *
 * @module server/modules/solana/config/program-config.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { config } from '../../../config';
import { isValidSolanaAddress } from '@signalforge/shared/validators/wallet-address.validator';

const PROGRAM_KEYS = Object.freeze({
  ATTESTATION: 'attestation',
  PROVENANCE: 'provenance',
  PAYMENT: 'payment',
});

function readProgramId({ key }) {
  const value = config.solana && config.solana.programs && config.solana.programs[key];

  if (!value) {
    return null;
  }

  if (!isValidSolanaAddress(value)) {
    throw new AppError(
      `Solana program ID for ${key} is invalid`,
      ERROR_CODES.CONFIGURATION_INVALID,
      500,
    );
  }

  return value;
}

export function getProgramId({ key }) {
  if (!key) {
    throw new AppError('program key is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const id = readProgramId({ key });

  if (!id) {
    throw new AppError(
      `Solana program ID for ${key} is not configured`,
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }

  return id;
}

export function tryGetProgramId({ key }) {
  return readProgramId({ key });
}

export function getPrograms() {
  return {
    attestation: readProgramId({ key: PROGRAM_KEYS.ATTESTATION }),
    provenance: readProgramId({ key: PROGRAM_KEYS.PROVENANCE }),
    payment: readProgramId({ key: PROGRAM_KEYS.PAYMENT }),
  };
}

export function isProgramConfigured({ key }) {
  return Boolean(readProgramId({ key }));
}

export function getTreasuryWallet() {
  const wallet = config.solana && config.solana.treasuryWallet;

  if (!wallet) {
    throw new AppError(
      'Solana treasury wallet is not configured',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }

  if (!isValidSolanaAddress(wallet)) {
    throw new AppError(
      'Solana treasury wallet is invalid',
      ERROR_CODES.CONFIGURATION_INVALID,
      500,
    );
  }

  return wallet;
}

export const programConfigService = {
  getProgramId,
  tryGetProgramId,
  getPrograms,
  isProgramConfigured,
  getTreasuryWallet,
  PROGRAM_KEYS,
};