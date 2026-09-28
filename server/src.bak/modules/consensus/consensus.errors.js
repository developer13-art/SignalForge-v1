/**
 * Consensus Errors
 *
 * @module signalforge/server/modules/consensus/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class ConsensusNotFoundError extends NotFoundError {
  constructor(message = 'Consensus record not found', details = {}) {
    super(message, { code: 'CONSENSUS_NOT_FOUND', details });
    this.name = 'ConsensusNotFoundError';
  }
}

export class InsufficientParticipantsError extends ValidationError {
  constructor(message = 'Insufficient participants for consensus', details = {}) {
    super(message, { code: 'INSUFFICIENT_PARTICIPANTS', details });
    this.name = 'InsufficientParticipantsError';
  }
}

export class ConsensusConflictError extends ConflictError {
  constructor(message = 'Conflicting signals detected in consensus', details = {}) {
    super(message, { code: 'CONSENSUS_CONFLICT', details });
    this.name = 'ConsensusConflictError';
  }
}

export class NoConsensusError extends ValidationError {
  constructor(message = 'No consensus reached among providers', details = {}) {
    super(message, { code: 'NO_CONSENSUS', details });
    this.name = 'NoConsensusError';
  }
}

export class VotingStrategyError extends ValidationError {
  constructor(message = 'Invalid voting strategy', details = {}) {
    super(message, { code: 'INVALID_VOTING_STRATEGY', details });
    this.name = 'VotingStrategyError';
  }
}

export class ConsensusComputationError extends Error {
  constructor(message = 'Consensus computation failed', details = {}) {
    super(message);
    this.name = 'ConsensusComputationError';
    this.code = 'CONSENSUS_COMPUTATION_FAILED';
    this.details = details;
  }
}