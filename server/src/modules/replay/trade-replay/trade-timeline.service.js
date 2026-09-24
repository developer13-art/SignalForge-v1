/**
 * Trade Timeline Service
 *
 * Builds a trade-specific timeline from trade_events, execution logs,
 * and shadow comparisons. Normalizes into a consistent shape for
 * consumption by the trade replay service and UI.
 *
 * @module server/modules/replay/trade-replay/trade-timeline.service
 */

import { replayRepository } from '../replay.repository';
import { timelineBuilderService } from '../signal-replay/timeline-builder.service';

export async function buildTradeTimeline({ tradeId }) {
  const tradeEvents = await replayRepository.listTradeEvents({ tradeId });
  const executionLogs = await replayRepository.listExecutionLogs({ tradeId });

  const normalizedTradeEvents = tradeEvents.map((row) => ({
    id: row.id,
    source: 'trade_event',
    eventType: row.event_type,
    actorType: row.actor_type,
    actorId: row.actor_id,
    occurredAt: row.created_at,
    details: row.details,
  }));

  const normalizedExecutionLogs = executionLogs.map((row) => ({
    id: row.id,
    source: 'execution_log',
    eventType: `EXECUTION_${row.status}`,
    actorType: 'SYSTEM',
    actorId: null,
    occurredAt: row.created_at,
    details: {
      executionRequestId: row.execution_request_id,
      attempt: row.attempt,
      brokerResponse: row.broker_response,
      error: row.error,
    },
  }));

  const merged = timelineBuilderService.mergeEvents({
    streams: [normalizedTradeEvents, normalizedExecutionLogs],
  });

  return merged;
}

export async function buildTradeTimelineSummary({ tradeId }) {
  const events = await buildTradeTimeline({ tradeId });

  const summary = timelineBuilderService.buildTimelineSummary({ events });
  const durations = timelineBuilderService.calculateDurations({ events });

  return { events, summary, durations };
}

export const tradeTimelineService = {
  buildTradeTimeline,
  buildTradeTimelineSummary,
};