/**
 * PDA Service
 *
 * Derives program-derived addresses for each of the platform's
 * on-chain programs. The derivation rules must match the Anchor
 * programs exactly.
 *
 * @module server/modules/solana/programs/pda.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { programConfigService } = require('../config/program-config.service');

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

async function derivePda({ programId, seeds }) {
  const web3 = await loadWeb3();
  const programPublicKey = new web3.PublicKey(programId);

  const seedBuffers = seeds.map((seed) => {
    if (Buffer.isBuffer(seed)) {
      return seed;
    }
    if (typeof seed === 'string') {
      return Buffer.from(seed, 'utf8');
    }
    if (seed && typeof seed.toBuffer === 'function') {
      return seed.toBuffer();
    }
    throw new AppError('Invalid PDA seed type', ERROR_CODES.VALIDATION_FAILED, 400);
  });

  const [pda, bump] = await web3.PublicKey.findProgramAddress(seedBuffers, programPublicKey);

  return { pda: pda.toString(), bump };
}
async function deriveAttestationPda({ subjectType, subjectId, attestationType }) {
  if (!subjectType || !subjectId || !attestationType) {
    throw new AppError(
      'subjectType, subjectId, and attestationType are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const programId = programConfigService.getProgramId({ key: 'attestation' });

  return derivePda({
    programId,
    seeds: ['attestation', subjectType, subjectId, attestationType],
  });
}
async function deriveProvenancePda({ signalId, aiVersion }) {
  if (!signalId || !aiVersion) {
    throw new AppError('signalId and aiVersion are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const programId = programConfigService.getProgramId({ key: 'provenance' });

  return derivePda({
    programId,
    seeds: ['provenance', signalId, aiVersion],
  });
}
async function derivePaymentPda({ reference }) {
  if (!reference) {
    throw new AppError('reference is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const programId = programConfigService.getProgramId({ key: 'payment' });

  return derivePda({
    programId,
    seeds: ['payment', reference],
  });
}
async function deriveAuthorityPda({ programKey }) {
  const programId = programConfigService.getProgramId({ key: programKey });

  return derivePda({
    programId,
    seeds: ['authority'],
  });
}
async function deriveTreasuryPda({ programKey = 'payment' } = {}) {
  const programId = programConfigService.getProgramId({ key: programKey });

  return derivePda({
    programId,
    seeds: ['treasury'],
  });
}
async function tryDerive({ fn, args }) {
  try {
    return await fn(args);
  } catch (err) {
    logger.warn({ err }, 'PDA derivation failed');
    return null;
  }
}
const pdaService = {
  deriveAttestationPda,
  deriveProvenancePda,
  derivePaymentPda,
  deriveAuthorityPda,
  deriveTreasuryPda,
  tryDerive,
};
module.exports.pdaService = pdaService;

module.exports.deriveAttestationPda = deriveAttestationPda;

module.exports.deriveProvenancePda = deriveProvenancePda;

module.exports.derivePaymentPda = derivePaymentPda;

module.exports.deriveAuthorityPda = deriveAuthorityPda;

module.exports.deriveTreasuryPda = deriveTreasuryPda;

module.exports.tryDerive = tryDerive;
