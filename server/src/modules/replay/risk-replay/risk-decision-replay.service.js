/**
 * Risk Decision Replay Service
 *
 * Reconstructs the risk decisions taken for a signal across all
 * affected users, exposing the exact set of checks performed and
 * their outcomes.
 *
 * @module server/modules/replay/risk-replay/risk-decision-replay.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { replayRepository } from '../replay.repository';

function parseChecks(checks) {
  if (!checks) {
    return [];
  }
  if (typeof checks === 'string') {
    try {
      return JSON.parse(checks);
    } catch (err) {
      return [];
    }
  }
  if (Array.isArray(checks)) {
    return checks;
  }
  return [];
}

export async function buildRiskReplay({ signalId, userId }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const signal = await replayRepository.findSignalById({ signalId });

  if (!signal) {
    throw new AppError('Signal not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const decisions = await replayRepository.listRiskDecisions({ signalId, userId });

  const timeline = decisions.map((row) => ({
    id: row.id,
    source: 'risk_decision',
    eventType: row.decision === 'APPROVED' ? 'RISK_APPROVED' : 'RISK_REJECTED',
    actorType: 'RISK_ENGINE',
    actorId: row.user_id,
    occurredAt: row.created_at,
    details: {
      decision: row.decision,
      checks: parseChecks(row.checks),
      reason: row.reason,
      durationMs: row.duration_ms,
    },
  }));

  const totalDecisions = decisions.length;
  const approvedCount = decisions.filter((d) => d.decision === 'APPROVED').length;
  const rejectedCount = decisions.filter((d) => d.decision === 'REJECTED').length;

  const failureCounts = {};
  for (const decision of decisions) {
    const checks = parseChecks(decision.checks);
    for (const check of checks) {
      if (check && check.passed === false && check.name) {
        failureCounts[check.name] = (failureCounts[check.name] || 0) + 1;
      }
    }
  }

  return {
    signalId,
    timeline,
    summary: {
      totalDecisions,
      approvedCount,
      rejectedCount,
      failureCounts,
    },
  };
}

export const riskDecisionReplayService = {
  buildRiskReplay,
};