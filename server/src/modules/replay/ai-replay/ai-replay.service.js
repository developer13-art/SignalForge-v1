/**
 * AI Replay Service
 *
 * Reconstructs the AI processing history of a signal: every parse
 * attempt, its confidence, and the resulting structured output.
 *
 * @module server/modules/replay/ai-replay/ai-replay.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { replayRepository } = require('../replay.repository');
const { aiTimelineService } = require('./ai-timeline.service');
async function buildAiReplay({ signalId, userId }) {
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

  const timeline = await aiTimelineService.buildAiTimeline({ signalId });
  const summary = await aiTimelineService.summarizeAiTimeline({ signalId });

  return {
    signalId,
    timeline,
    summary,
  };
}
const aiReplayService = {
  buildAiReplay,
};
module.exports.aiReplayService = aiReplayService;

module.exports.buildAiReplay = buildAiReplay;
