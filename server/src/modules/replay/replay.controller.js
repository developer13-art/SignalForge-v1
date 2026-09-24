/**
 * Replay Controller
 *
 * HTTP handlers for replay operations.
 *
 * @module server/modules/replay/replay.controller
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { successResponse } from '../../lib/response/success.response';
import { replayService } from './replay.service';

export async function getSignalReplay(req, res) {
  const userId = req.user && req.user.id;
  const { signalId } = req.params;
  const { includeAi, includeRisk, includeExecution } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replaySignal({
    signalId,
    userId,
    includeAi: includeAi !== 'false',
    includeRisk: includeRisk !== 'false',
    includeExecution: includeExecution !== 'false',
  });

  return successResponse(res, result);
}

export async function getTradeReplay(req, res) {
  const userId = req.user && req.user.id;
  const { tradeId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayTrade({ tradeId, userId });

  return successResponse(res, result);
}

export async function getAiReplay(req, res) {
  const userId = req.user && req.user.id;
  const { signalId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayAiProcessing({ signalId, userId });

  return successResponse(res, result);
}

export async function getRiskReplay(req, res) {
  const userId = req.user && req.user.id;
  const { signalId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayRiskDecision({ signalId, userId });

  return successResponse(res, result);
}

export async function getExecutionReplay(req, res) {
  const userId = req.user && req.user.id;
  const { tradeId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayExecution({ tradeId, userId });

  return successResponse(res, result);
}

export async function getProviderMessageReplay(req, res) {
  const userId = req.user && req.user.id;
  const { providerId, sourceId, externalMessageId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayProviderMessage({
    providerId,
    sourceId,
    externalMessageId,
    userId,
  });

  return successResponse(res, result);
}

export async function getSystemReplay(req, res) {
  const userId = req.user && req.user.id;
  const { correlationId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replaySystemTimeline({ correlationId, userId });

  return successResponse(res, result);
}

export const replayController = {
  getSignalReplay,
  getTradeReplay,
  getAiReplay,
  getRiskReplay,
  getExecutionReplay,
  getProviderMessageReplay,
  getSystemReplay,
};