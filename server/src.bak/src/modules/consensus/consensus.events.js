/**
 * Consensus Event Helpers
 *
 * @module signalforge/server/modules/consensus/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { CONSENSUS_EVENTS } = require('./consensus.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'consensus',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitConsensusStarted(symbol, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_STARTED, {
    symbol,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConsensusReached(symbol, consensusId, result, meta = {}) {
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
function emitConsensusFailed(symbol, reason, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_FAILED, {
    symbol,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConsensusConflictDetected(symbol, conflict, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_CONFLICT_DETECTED, {
    symbol,
    conflict,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConsensusInsufficientParticipants(symbol, count, required, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_INSUFFICIENT_PARTICIPANTS, {
    symbol,
    participantCount: count,
    required,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConsensusMemberAdded(consensusId, providerId, direction, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_MEMBER_ADDED, {
    consensusId,
    providerId,
    direction,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConsensusVoteCast(consensusId, providerId, direction, weight, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_VOTE_CAST, {
    consensusId,
    providerId,
    direction,
    weight,
    castAt: new Date().toISOString(),
    ...meta,
  });
}
function emitConsensusDecisionMade(consensusId, decision, meta = {}) {
  return publish(CONSENSUS_EVENTS.CONSENSUS_DECISION_MADE, {
    consensusId,
    decision,
    decidedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitConsensusStarted = emitConsensusStarted;
module.exports.emitConsensusReached = emitConsensusReached;
module.exports.emitConsensusFailed = emitConsensusFailed;
module.exports.emitConsensusConflictDetected = emitConsensusConflictDetected;
module.exports.emitConsensusInsufficientParticipants = emitConsensusInsufficientParticipants;
module.exports.emitConsensusMemberAdded = emitConsensusMemberAdded;
module.exports.emitConsensusVoteCast = emitConsensusVoteCast;
module.exports.emitConsensusDecisionMade = emitConsensusDecisionMade;
