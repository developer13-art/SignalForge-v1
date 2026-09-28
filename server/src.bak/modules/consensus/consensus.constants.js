/**
 * Multi-Provider Consensus Constants
 *
 * @module signalforge/server/modules/consensus/constants
 */

export const CONSENSUS_EVENTS = Object.freeze({
  CONSENSUS_STARTED: 'consensus.started',
  CONSENSUS_REACHED: 'consensus.reached',
  CONSENSUS_FAILED: 'consensus.failed',
  CONSENSUS_CONFLICT_DETECTED: 'consensus.conflict.detected',
  CONSENSUS_INSUFFICIENT_PARTICIPANTS: 'consensus.insufficient_participants',
  CONSENSUS_MEMBER_ADDED: 'consensus.member.added',
  CONSENSUS_VOTE_CAST: 'consensus.vote.cast',
  CONSENSUS_DECISION_MADE: 'consensus.decision.made',
});

export const CONSENSUS_OUTCOMES = Object.freeze({
  REACHED: 'REACHED',
  FAILED: 'FAILED',
  INSUFFICIENT_PARTICIPANTS: 'INSUFFICIENT_PARTICIPANTS',
  CONFLICT: 'CONFLICT',
  ERROR: 'ERROR',
});

export const CONSENSUS_DIRECTIONS = Object.freeze({
  BUY: 'BUY',
  SELL: 'SELL',
  NO_CONSENSUS: 'NO_CONSENSUS',
});

export const VOTING_STRATEGIES = Object.freeze({
  SIMPLE_MAJORITY: 'SIMPLE_MAJORITY',
  WEIGHTED_BY_CONFIDENCE: 'WEIGHTED_BY_CONFIDENCE',
  WEIGHTED_BY_REPUTATION: 'WEIGHTED_BY_REPUTATION',
  SUPER_MAJORITY: 'SUPER_MAJORITY',
  UNANIMOUS: 'UNANIMOUS',
});

export const VOTING_STRATEGY_VALUES = Object.freeze(Object.values(VOTING_STRATEGIES));

export const DEFAULT_CONSENSUS_WINDOW_MINUTES = 5;
export const DEFAULT_MINIMUM_PARTICIPANTS = 2;
export const DEFAULT_MINIMUM_AGREEMENT = 0.6;
export const DEFAULT_HIGH_CONFIDENCE_THRESHOLD = 0.8;
export const DEFAULT_SUPER_MAJORITY_THRESHOLD = 0.75;
export const DEFAULT_REPUTATION_WEIGHT = 1.0;
export const DEFAULT_CONFIDENCE_WEIGHT = 1.0;
export const DEFAULT_VOTE_WEIGHT = 1.0;

export const MAX_PARTICIPANTS = 100;
export const MAX_WINDOW_MINUTES = 60;

export function isValidVotingStrategy(strategy) {
  return VOTING_STRATEGY_VALUES.includes(strategy);
}

export function isValidConsensusOutcome(outcome) {
  return Object.values(CONSENSUS_OUTCOMES).includes(outcome);
}