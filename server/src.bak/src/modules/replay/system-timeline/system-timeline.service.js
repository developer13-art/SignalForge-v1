/**
 * System Timeline Service
 *
 * Builds a coherent system-level timeline from events that share a
 * correlation id. Used by the replay center and by support tooling to
 * understand how a request propagated through the platform.
 *
 * @module server/modules/replay/system-timeline/system-timeline.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { timelineBuilderService } = require('../signal-replay/timeline-builder.service');
const { eventReconstructorService } = require('./event-reconstructor.service');

export async function buildSystemTimeline({ correlationId, userId }) {
  if (!correlationId) {
    throw new AppError('correlationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const events = await eventReconstructorService.reconstructByCorrelation({ correlationId });

  const merged = timelineBuilderService.mergeEvents({
    streams: [events],
  });

  const summary = timelineBuilderService.buildTimelineSummary({ events: merged });
  const durations = timelineBuilderService.calculateDurations({ events: merged });
  const chain = eventReconstructorService.buildCausationChain({ events: merged });
  const flat = eventReconstructorService.flattenChain({ roots: chain });

  return {
    correlationId,
    requestedBy: userId || null,
    timeline: merged,
    summary,
    durations,
    causationChain: flat,
  };
}
const systemTimelineService = {
  buildSystemTimeline,
};
module.exports.systemTimelineService = systemTimelineService;
