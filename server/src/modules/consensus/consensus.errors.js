/**
 * Consensus Errors
 *
 * @module signalforge/server/modules/consensus/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
class ConsensusNotFoundError extends NotFoundError {
  constructor(message = 'Consensus record not found', details = {}) {
    super(message, { code: 'CONSENSUS_NOT_FOUND', details });
    this.name = 'ConsensusNotFoundError';
  }
}
class InsufficientParticipantsError extends ValidationError {
  constructor(message = 'Insufficient participants for consensus', details = {}) {
    super(message, { code: 'INSUFFICIENT_PARTICIPANTS', details });
    this.name = 'InsufficientParticipantsError';
  }
}
class ConsensusConflictError extends ConflictError {
  constructor(message = 'Conflicting signals detected in consensus', details = {}) {
    super(message, { code: 'CONSENSUS_CONFLICT', details });
    this.name = 'ConsensusConflictError';
  }
}
class NoConsensusError extends ValidationError {
  constructor(message = 'No consensus reached among providers', details = {}) {
    super(message, { code: 'NO_CONSENSUS', details });
    this.name = 'NoConsensusError';
  }
}
class VotingStrategyError extends ValidationError {
  constructor(message = 'Invalid voting strategy', details = {}) {
    super(message, { code: 'INVALID_VOTING_STRATEGY', details });
    this.name = 'VotingStrategyError';
  }
}
class ConsensusComputationError extends Error {
  constructor(message = 'Consensus computation failed', details = {}) {
    super(message);
    this.name = 'ConsensusComputationError';
    this.code = 'CONSENSUS_COMPUTATION_FAILED';
    this.details = details;
  }
}
module.exports.ConsensusNotFoundError = ConsensusNotFoundError;
module.exports.InsufficientParticipantsError = InsufficientParticipantsError;
module.exports.ConsensusConflictError = ConsensusConflictError;
module.exports.NoConsensusError = NoConsensusError;
module.exports.VotingStrategyError = VotingStrategyError;
module.exports.ConsensusComputationError = ConsensusComputationError;
