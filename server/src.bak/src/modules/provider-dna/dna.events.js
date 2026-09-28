/**
 * Provider DNA Event Helpers
 *
 * @module signalforge/server/modules/provider-dna/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { DNA_EVENTS } = require('./dna.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'provider-dna',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitDnaCreated(providerId, dnaId, meta = {}) {
  return publish(DNA_EVENTS.DNA_CREATED, {
    providerId,
    dnaId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaUpdated(providerId, changes, meta = {}) {
  return publish(DNA_EVENTS.DNA_UPDATED, {
    providerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaVersionCreated(providerId, version, meta = {}) {
  return publish(DNA_EVENTS.DNA_VERSION_CREATED, {
    providerId,
    version,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaRuleCreated(providerId, ruleId, ruleType, meta = {}) {
  return publish(DNA_EVENTS.DNA_RULE_CREATED, {
    providerId,
    ruleId,
    ruleType,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaRuleUpdated(providerId, ruleId, changes, meta = {}) {
  return publish(DNA_EVENTS.DNA_RULE_UPDATED, {
    providerId,
    ruleId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaRuleDeleted(providerId, ruleId, meta = {}) {
  return publish(DNA_EVENTS.DNA_RULE_DELETED, {
    providerId,
    ruleId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaLearningStarted(providerId, messageCount, meta = {}) {
  return publish(DNA_EVENTS.DNA_LEARNING_STARTED, {
    providerId,
    messageCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaLearningCompleted(providerId, rulesLearned, meta = {}) {
  return publish(DNA_EVENTS.DNA_LEARNING_COMPLETED, {
    providerId,
    rulesLearned,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaLearningFailed(providerId, error, meta = {}) {
  return publish(DNA_EVENTS.DNA_LEARNING_FAILED, {
    providerId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaFastPathHit(providerId, messageId, ruleId, meta = {}) {
  return publish(DNA_EVENTS.DNA_FAST_PATH_HIT, {
    providerId,
    messageId,
    ruleId,
    hitAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaFastPathMiss(providerId, messageId, meta = {}) {
  return publish(DNA_EVENTS.DNA_FAST_PATH_MISS, {
    providerId,
    messageId,
    missedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaReinforcementApplied(providerId, ruleId, weight, meta = {}) {
  return publish(DNA_EVENTS.DNA_REINFORCEMENT_APPLIED, {
    providerId,
    ruleId,
    weight,
    appliedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaProfileUpdated(providerId, section, meta = {}) {
  return publish(DNA_EVENTS.DNA_PROFILE_UPDATED, {
    providerId,
    section,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDnaTestCompleted(providerId, result, meta = {}) {
  return publish(DNA_EVENTS.DNA_TEST_COMPLETED, {
    providerId,
    result,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitDnaCreated = emitDnaCreated;
module.exports.emitDnaUpdated = emitDnaUpdated;
module.exports.emitDnaVersionCreated = emitDnaVersionCreated;
module.exports.emitDnaRuleCreated = emitDnaRuleCreated;
module.exports.emitDnaRuleUpdated = emitDnaRuleUpdated;
module.exports.emitDnaRuleDeleted = emitDnaRuleDeleted;
module.exports.emitDnaLearningStarted = emitDnaLearningStarted;
module.exports.emitDnaLearningCompleted = emitDnaLearningCompleted;
module.exports.emitDnaLearningFailed = emitDnaLearningFailed;
module.exports.emitDnaFastPathHit = emitDnaFastPathHit;
module.exports.emitDnaFastPathMiss = emitDnaFastPathMiss;
module.exports.emitDnaReinforcementApplied = emitDnaReinforcementApplied;
module.exports.emitDnaProfileUpdated = emitDnaProfileUpdated;
module.exports.emitDnaTestCompleted = emitDnaTestCompleted;
