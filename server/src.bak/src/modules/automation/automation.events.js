/**
 * Automation Event Helpers
 *
 * @module signalforge/server/modules/automation/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { AUTOMATION_EVENTS } = require('./automation.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'automation',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitRuleCreated(userId, ruleId, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_CREATED, {
    userId,
    ruleId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleUpdated(userId, ruleId, changes, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_UPDATED, {
    userId,
    ruleId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleDeleted(userId, ruleId, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_DELETED, {
    userId,
    ruleId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleEnabled(userId, ruleId, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_ENABLED, {
    userId,
    ruleId,
    enabledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleDisabled(userId, ruleId, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_DISABLED, {
    userId,
    ruleId,
    disabledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleTriggered(userId, ruleId, context, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_TRIGGERED, {
    userId,
    ruleId,
    context,
    triggeredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleMatched(userId, ruleId, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_MATCHED, {
    userId,
    ruleId,
    matchedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleExecuted(userId, ruleId, action, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_EXECUTED, {
    userId,
    ruleId,
    action,
    executedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRuleFailed(userId, ruleId, error, meta = {}) {
  return publish(AUTOMATION_EVENTS.RULE_FAILED, {
    userId,
    ruleId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitEvaluationStarted(userId, meta = {}) {
  return publish(AUTOMATION_EVENTS.EVALUATION_STARTED, {
    userId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitEvaluationCompleted(userId, result, meta = {}) {
  return publish(AUTOMATION_EVENTS.EVALUATION_COMPLETED, {
    userId,
    matchedCount: result.matchedCount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitRuleCreated = emitRuleCreated;
module.exports.emitRuleUpdated = emitRuleUpdated;
module.exports.emitRuleDeleted = emitRuleDeleted;
module.exports.emitRuleEnabled = emitRuleEnabled;
module.exports.emitRuleDisabled = emitRuleDisabled;
module.exports.emitRuleTriggered = emitRuleTriggered;
module.exports.emitRuleMatched = emitRuleMatched;
module.exports.emitRuleExecuted = emitRuleExecuted;
module.exports.emitRuleFailed = emitRuleFailed;
module.exports.emitEvaluationStarted = emitEvaluationStarted;
module.exports.emitEvaluationCompleted = emitEvaluationCompleted;
