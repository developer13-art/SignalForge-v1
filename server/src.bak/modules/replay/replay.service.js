/**
 * Replay Service
 *
 * Top-level orchestration for the replay subsystem. Provides a single
 * entry point to reconstruct the timeline of a signal or trade, and
 * dispatches to the appropriate specialized replay service.
 *
 * @module server/modules/replay/replay.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { REPLAY_TYPES } from './replay.constants';
import { signalReplayService } from './signal-replay/signal-replay.service';
import { tradeReplayService } from './trade-replay/trade-replay.service';
import { aiReplayService } from './ai-replay/ai-replay.service';
import { riskDecisionReplayService } from './risk-replay/risk-decision-replay.service';
import { executionReplayService } from './execution-replay/execution-replay.service';
import { providerMessageReplayService } from './provider-message-replay/provider-message-replay.service';
import { systemTimelineService } from './system-timeline/system-timeline.service';

export async function replaySignal({ signalId, userId, includeAi = true, includeRisk = true, includeExecution = true }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await signalReplayService.buildSignalReplay({
    signalId,
    userId,
    includeAi,
    includeRisk,
    includeExecution,
  });

  logger.info({ signalId, userId }, 'Signal replay built');

  return result;
}

export async function replayTrade({ tradeId, userId }) {
  if (!tradeId) {
    throw new AppError('tradeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await tradeReplayService.buildTradeReplay({ tradeId, userId });

  logger.info({ tradeId, userId }, 'Trade replay built');

  return result;
}

export async function replayAiProcessing({ signalId, userId }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return aiReplayService.buildAiReplay({ signalId, userId });
}

export async function replayRiskDecision({ signalId, userId }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return riskDecisionReplayService.buildRiskReplay({ signalId, userId });
}

export async function replayExecution({ tradeId, userId }) {
  if (!tradeId) {
    throw new AppError('tradeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return executionReplayService.buildExecutionReplay({ tradeId, userId });
}

export async function replayProviderMessage({ providerId, sourceId, externalMessageId, userId }) {
  if (!providerId || !externalMessageId) {
    throw new AppError('providerId and externalMessageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return providerMessageReplayService.buildProviderMessageReplay({
    providerId,
    sourceId,
    externalMessageId,
    userId,
  });
}

export async function replaySystemTimeline({ correlationId, userId }) {
  if (!correlationId) {
    throw new AppError('correlationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return systemTimelineService.buildSystemTimeline({ correlationId, userId });
}

export async function replayAny({ type, id, userId, options = {} }) {
  if (!type || !id) {
    throw new AppError('type and id are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  switch (type) {
    case REPLAY_TYPES.SIGNAL:
      return replaySignal({ signalId: id, userId, ...options });
    case REPLAY_TYPES.TRADE:
      return replayTrade({ tradeId: id, userId });
    case REPLAY_TYPES.AI:
      return replayAiProcessing({ signalId: id, userId });
    case REPLAY_TYPES.RISK:
      return replayRiskDecision({ signalId: id, userId });
    case REPLAY_TYPES.EXECUTION:
      return replayExecution({ tradeId: id, userId });
    case REPLAY_TYPES.PROVIDER_MESSAGE:
      return replayProviderMessage({ externalMessageId: id, ...options, userId });
    case REPLAY_TYPES.SYSTEM:
      return replaySystemTimeline({ correlationId: id, userId });
    default:
      throw new AppError(`Unsupported replay type: ${type}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
}

export const replayService = {
  replaySignal,
  replayTrade,
  replayAiProcessing,
  replayRiskDecision,
  replayExecution,
  replayProviderMessage,
  replaySystemTimeline,
  replayAny,
};