/**
 * Signal Replay Service
 *
 * Reconstructs the full lifecycle of a signal from receipt to
 * execution, combining data from source messages, parses, risk
 * decisions, execution logs, and trade events.
 *
 * @module server/modules/replay/signal-replay/signal-replay.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { replayRepository } from '../replay.repository';
import { timelineBuilderService } from './timeline-builder.service';

function mapSignalEvent(row) {
  return {
    id: row.id,
    source: 'signal_event',
    eventType: row.event_type,
    actorType: row.actor_type,
    actorId: row.actor_id,
    occurredAt: row.created_at,
    details: row.details,
  };
}

function mapTradeEvent(row, tradeId) {
  return {
    id: row.id,
    source: `trade_event:${tradeId}`,
    eventType: row.event_type,
    actorType: row.actor_type,
    actorId: row.actor_id,
    occurredAt: row.created_at,
    details: row.details,
  };
}

function mapAiParse(row) {
  return {
    id: row.id,
    source: 'signal_parse',
    eventType: 'AI_PARSED',
    actorType: 'SYSTEM',
    actorId: null,
    occurredAt: row.created_at,
    details: {
      parserType: row.parser_type,
      model: row.model,
      confidence: row.confidence,
      durationMs: row.duration_ms,
    },
  };
}

function mapRiskDecision(row) {
  return {
    id: row.id,
    source: 'risk_decision',
    eventType: row.decision === 'APPROVED' ? 'RISK_APPROVED' : 'RISK_REJECTED',
    actorType: 'RISK_ENGINE',
    actorId: row.user_id,
    occurredAt: row.created_at,
    details: {
      decision: row.decision,
      checks: row.checks,
      reason: row.reason,
      durationMs: row.duration_ms,
    },
  };
}

function mapExecutionLog(row, tradeId) {
  return {
    id: row.id,
    source: `execution_log:${tradeId}`,
    eventType: row.status,
    actorType: 'SYSTEM',
    actorId: null,
    occurredAt: row.created_at,
    details: {
      executionRequestId: row.execution_request_id,
      attempt: row.attempt,
      brokerResponse: row.broker_response,
      error: row.error,
    },
  };
}

export async function buildSignalReplay({ signalId, userId, includeAi = true, includeRisk = true, includeExecution = true }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const signal = await replayRepository.findSignalById({ signalId });

  if (!signal) {
    throw new AppError('Signal not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (userId && signal.user_id && signal.user_id !== userId) {
    throw new AppError('Signal does not belong to the requesting user', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  const signalEvents = await replayRepository.listSignalEvents({ signalId });

  const streams = [signalEvents.map(mapSignalEvent)];

  if (includeAi) {
    const aiLogs = await replayRepository.listAiProcessingLogs({ signalId });
    streams.push(aiLogs.map(mapAiParse));
  }

  if (includeRisk) {
    const riskDecisions = await replayRepository.listRiskDecisions({ signalId, userId });
    streams.push(riskDecisions.map(mapRiskDecision));
  }

  const tradeIds = await replayRepository.findTradeIdsBySignal({ signalId });

  for (const tradeId of tradeIds) {
    const tradeEvents = await replayRepository.listTradeEvents({ tradeId });
    streams.push(tradeEvents.map((row) => mapTradeEvent(row, tradeId)));

    if (includeExecution) {
      const execLogs = await replayRepository.listExecutionLogs({ tradeId });
      streams.push(execLogs.map((row) => mapExecutionLog(row, tradeId)));
    }
  }

  const merged = timelineBuilderService.mergeEvents({ streams });

  const summary = timelineBuilderService.buildTimelineSummary({ events: merged });
  const durations = timelineBuilderService.calculateDurations({ events: merged });

  return {
    signalId,
    signal: {
      id: signal.id,
      symbol: signal.symbol,
      direction: signal.direction,
      confidence: signal.confidence,
      classification: signal.classification,
      status: signal.status,
      createdAt: signal.created_at,
    },
    timeline: merged,
    summary,
    durations,
    relatedTradeIds: tradeIds,
  };
}

export const signalReplayService = {
  buildSignalReplay,
};