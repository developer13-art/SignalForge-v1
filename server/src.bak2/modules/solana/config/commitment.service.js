/**
 * Commitment Service
 *
 * Normalizes and validates Solana commitment levels used by
 * transactions and reads. All commitment strings across the Solana
 * module flow through this service.
 *
 * @module server/modules/solana/config/commitment.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { config } = require('../../../config');
const { SOLANA_COMMITMENT_LEVELS, SOLANA_DEFAULT_COMMITMENT, isValidCommitment } = require('../solana.constants');
function getDefaultCommitment() {
  const configured = config.solana && config.solana.commitment;
  return configured && isValidCommitment(configured) ? configured : SOLANA_DEFAULT_COMMITMENT;
}
function normalizeCommitment({ commitment }) {
  const resolved = commitment || getDefaultCommitment();

  if (!isValidCommitment(resolved)) {
    throw new AppError(
      `Invalid commitment level: ${resolved}`,
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  return resolved;
}
function describeCommitment({ commitment }) {
  const resolved = normalizeCommitment({ commitment });

  switch (resolved) {
    case SOLANA_COMMITMENT_LEVELS.PROCESSED:
      return { level: resolved, description: 'Fastest, lowest confidence.', confirmationsRequired: 0 };
    case SOLANA_COMMITMENT_LEVELS.CONFIRMED:
      return { level: resolved, description: 'Default. Balanced confidence.', confirmationsRequired: 1 };
    case SOLANA_COMMITMENT_LEVELS.FINALIZED:
      return { level: resolved, description: 'Highest confidence, slowest.', confirmationsRequired: 32 };
    default:
      return { level: resolved, description: 'Unknown', confirmationsRequired: 0 };
  }
}
function isStrongerThan({ a, b }) {
  const order = {
    [SOLANA_COMMITMENT_LEVELS.PROCESSED]: 1,
    [SOLANA_COMMITMENT_LEVELS.CONFIRMED]: 2,
    [SOLANA_COMMITMENT_LEVELS.FINALIZED]: 3,
  };

  const scoreA = order[normalizeCommitment({ commitment: a })];
  const scoreB = order[normalizeCommitment({ commitment: b })];

  return scoreA > scoreB;
}
const commitmentService = {
  getDefaultCommitment,
  normalizeCommitment,
  describeCommitment,
  isStrongerThan,
};
module.exports.commitmentService = commitmentService;
module.exports.getDefaultCommitment = getDefaultCommitment;
module.exports.normalizeCommitment = normalizeCommitment;
module.exports.describeCommitment = describeCommitment;
module.exports.isStrongerThan = isStrongerThan;
