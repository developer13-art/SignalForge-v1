/**
 * Consensus Event Helpers
 *
 * @module signalforge/server/modules/consensus/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { CONSENSUS_EVENTS } from './consensus.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'consensus',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitConsensusStarted(symbol, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_STARTED, {
    symbol,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusReached(symbol, consensusId, result, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_REACHED, {
    symbol,
    consensusId,
    direction: result.direction,
    agreementScore: result.agreementScore,
    confidenceScore: result.confidenceScore,
    reachedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusFailed(symbol, reason, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_FAILED, {
    symbol,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusConflictDetected(symbol, conflict, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_CONFLICT_DETECTED, {
    symbol,
    conflict,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusInsufficientParticipants(symbol, count, required, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_INSUFFICIENT_PARTICIPANTS, {
    symbol,
    participantCount: count,
    required,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusMemberAdded(consensusId, providerId, direction, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_MEMBER_ADDED, {
    consensusId,
    providerId,
    direction,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusVoteCast(consensusId, providerId, direction, weight, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_VOTE_CAST, {
    consensusId,
    providerId,
    direction,
    weight,
    castAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitConsensusDecisionMade(consensusId, decision, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_DECISION_MADE, {
    consensusId,
    decision,
    decidedAt: new Date().toISOString(),
    ...meta,
  });
}

export { CONSENSUS_EVENTS };