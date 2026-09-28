/**
 * Commitment Service
 *
 * Normalizes and validates Solana commitment levels used by
 * transactions and reads. All commitment strings across the Solana
 * module flow through this service.
 *
 * @module server/modules/solana/config/commitment.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { config } from '../../../config';
import {
  SOLANA_COMMITMENT_LEVELS,
  SOLANA_DEFAULT_COMMITMENT,
  isValidCommitment,
} from '../solana.constants';

export function getDefaultCommitment() {
  const configured = config.solana && config.solana.commitment;
  return configured && isValidCommitment(configured) ? configured : SOLANA_DEFAULT_COMMITMENT;
}

export function normalizeCommitment({ commitment }) {
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

export function describeCommitment({ commitment }) {
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

export function isStrongerThan({ a, b }) {
  const order = {
    [SOLANA_COMMITMENT_LEVELS.PROCESSED]: 1,
    [SOLANA_COMMITMENT_LEVELS.CONFIRMED]: 2,
    [SOLANA_COMMITMENT_LEVELS.FINALIZED]: 3,
  };

  const scoreA = order[normalizeCommitment({ commitment: a })];
  const scoreB = order[normalizeCommitment({ commitment: b })];

  return scoreA > scoreB;
}

export const commitmentService = {
  getDefaultCommitment,
  normalizeCommitment,
  describeCommitment,
  isStrongerThan,
};