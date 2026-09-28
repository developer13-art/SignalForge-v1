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
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { config } = require('../../../config');
const { isValidSolanaAddress } = require('@signalforge/shared/validators/wallet-address.validator');

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
function getProgramId({ key }) {
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
function tryGetProgramId({ key }) {
  return readProgramId({ key });
}
function getPrograms() {
  return {
    attestation: readProgramId({ key: PROGRAM_KEYS.ATTESTATION }),
    provenance: readProgramId({ key: PROGRAM_KEYS.PROVENANCE }),
    payment: readProgramId({ key: PROGRAM_KEYS.PAYMENT }),
  };
}
function isProgramConfigured({ key }) {
  return Boolean(readProgramId({ key }));
}
function getTreasuryWallet() {
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
const programConfigService = {
  getProgramId,
  tryGetProgramId,
  getPrograms,
  isProgramConfigured,
  getTreasuryWallet,
  PROGRAM_KEYS,
};
module.exports.programConfigService = programConfigService;
module.exports.getProgramId = getProgramId;
module.exports.tryGetProgramId = tryGetProgramId;
module.exports.getPrograms = getPrograms;
module.exports.isProgramConfigured = isProgramConfigured;
module.exports.getTreasuryWallet = getTreasuryWallet;
