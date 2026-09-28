/**
 * Execution Replay Service
 *
 * Reconstructs every execution attempt for a trade including broker
 * responses, retry attempts, and error details.
 *
 * @module server/modules/replay/execution-replay/execution-replay.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { replayRepository } from '../replay.repository';

function parseBrokerResponse(response) {
  if (!response) {
    return null;
  }
  if (typeof response === 'string') {
    try {
      return JSON.parse(response);
    } catch (err) {
      return response;
    }
  }
  return response;
}

export async function buildExecutionReplay({ tradeId, userId }) {
  if (!tradeId) {
    throw new AppError('tradeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trade = await replayRepository.findTradeById({ tradeId });

  if (!trade) {
    throw new AppError('Trade not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (userId && trade.user_id && trade.user_id !== userId) {
    throw new AppError('Trade does not belong to the requesting user', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  const logs = await replayRepository.listExecutionLogs({ tradeId });

  const timeline = logs.map((row) => ({
    id: row.id,
    source: 'execution_log',
    eventType: `EXECUTION_${row.status}`,
    actorType: 'SYSTEM',
    actorId: null,
    occurredAt: row.created_at,
    details: {
      executionRequestId: row.execution_request_id,
      attempt: row.attempt,
      status: row.status,
      brokerResponse: parseBrokerResponse(row.broker_response),
      error: row.error,
    },
  }));

  const attempts = logs.length;
  const successfulAttempts = logs.filter((l) => l.status === 'SUCCESS').length;
  const failedAttempts = logs.filter((l) => l.status === 'FAILED').length;

  const retryDurations = [];
  for (let i = 1; i < logs.length; i++) {
    const previous = new Date(logs[i - 1].created_at).getTime();
    const current = new Date(logs[i].created_at).getTime();
    retryDurations.push(current - previous);
  }

  return {
    tradeId,
    timeline,
    summary: {
      attempts,
      successfulAttempts,
      failedAttempts,
      averageRetryDelayMs:
        retryDurations.length > 0
          ? retryDurations.reduce((a, b) => a + b, 0) / retryDurations.length
          : 0,
    },
  };
}

export const executionReplayService = {
  buildExecutionReplay,
};