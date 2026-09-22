/**
 * Risk Decision Schema
 *
 * Defines the structure of a risk decision produced by the Risk Engine
 * for each signal and user combination.
 *
 * @module @signalforge/shared/schemas/risk-decision
 */

export const RISK_DECISION_SCHEMA = Object.freeze({
  type: 'object',
  required: ['decisionId', 'signalId', 'userId', 'decision', 'checks', 'timestamp'],
  properties: {
    decisionId: { type: 'string', format: 'uuid' },
    signalId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    brokerAccountId: { type: 'string', format: 'uuid', nullable: true },
    decision: {
      type: 'string',
      enum: ['APPROVED', 'REJECTED', 'REQUIRES_MANUAL_REVIEW'],
    },
    approvedVolume: { type: 'number', nullable: true, minimum: 0 },
    approvedRiskPercent: { type: 'number', nullable: true, minimum: 0 },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'passed'],
        properties: {
          name: { type: 'string' },
          passed: { type: 'boolean' },
          reason: { type: 'string', nullable: true },
          details: { type: 'object', nullable: true },
        },
      },
    },
    failedChecks: { type: 'array', items: { type: 'string' }, default: [] },
    reason: { type: 'string', nullable: true },
    durationMs: { type: 'number', nullable: true },
    timestamp: { type: 'string', format: 'date-time' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildRiskDecision(input) {
  return {
    decisionId: input.decisionId,
    signalId: input.signalId,
    userId: input.userId,
    brokerAccountId: input.brokerAccountId || null,
    decision: input.decision,
    approvedVolume: input.approvedVolume ?? null,
    approvedRiskPercent: input.approvedRiskPercent ?? null,
    checks: input.checks || [],
    failedChecks: input.failedChecks || [],
    reason: input.reason || null,
    durationMs: input.durationMs ?? null,
    timestamp: input.timestamp || new Date().toISOString(),
    metadata: input.metadata || null,
  };
}

export function validateRiskDecision(decision) {
  const errors = [];

  if (!decision || typeof decision !== 'object') {
    return { valid: false, errors: ['Risk decision must be an object'] };
  }

  for (const field of RISK_DECISION_SCHEMA.required) {
    if (decision[field] === undefined || decision[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  const validDecisions = ['APPROVED', 'REJECTED', 'REQUIRES_MANUAL_REVIEW'];
  if (decision.decision && !validDecisions.includes(decision.decision)) {
    errors.push(`Invalid decision value: ${decision.decision}`);
  }

  if (!Array.isArray(decision.checks)) {
    errors.push('Checks must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export const RISK_DECISION_FIELDS = Object.freeze(
  Object.keys(RISK_DECISION_SCHEMA.properties),
);