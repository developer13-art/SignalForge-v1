/**
 * Replay Controller
 *
 * HTTP handlers for replay operations.
 *
 * @module server/modules/replay/replay.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { successResponse } = require('../../lib/response/success.response');
const { replayService } = require('./replay.service');
async function getSignalReplay(req, res) {
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
async function getTradeReplay(req, res) {
  const userId = req.user && req.user.id;
  const { tradeId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayTrade({ tradeId, userId });

  return successResponse(res, result);
}
async function getAiReplay(req, res) {
  const userId = req.user && req.user.id;
  const { signalId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayAiProcessing({ signalId, userId });

  return successResponse(res, result);
}
async function getRiskReplay(req, res) {
  const userId = req.user && req.user.id;
  const { signalId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayRiskDecision({ signalId, userId });

  return successResponse(res, result);
}
async function getExecutionReplay(req, res) {
  const userId = req.user && req.user.id;
  const { tradeId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replayExecution({ tradeId, userId });

  return successResponse(res, result);
}
async function getProviderMessageReplay(req, res) {
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
async function getSystemReplay(req, res) {
  const userId = req.user && req.user.id;
  const { correlationId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await replayService.replaySystemTimeline({ correlationId, userId });

  return successResponse(res, result);
}
const replayController = {
  getSignalReplay,
  getTradeReplay,
  getAiReplay,
  getRiskReplay,
  getExecutionReplay,
  getProviderMessageReplay,
  getSystemReplay,
};
module.exports.replayController = replayController;

module.exports.getSignalReplay = getSignalReplay;

module.exports.getTradeReplay = getTradeReplay;

module.exports.getAiReplay = getAiReplay;

module.exports.getRiskReplay = getRiskReplay;

module.exports.getExecutionReplay = getExecutionReplay;

module.exports.getProviderMessageReplay = getProviderMessageReplay;

module.exports.getSystemReplay = getSystemReplay;
