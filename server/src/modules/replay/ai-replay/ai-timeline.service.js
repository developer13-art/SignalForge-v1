/**
 * AI Timeline Service
 *
 * Builds a chronological timeline of AI processing events for a
 * signal: parse attempts, DNA application, confidence scoring.
 *
 * @module server/modules/replay/ai-replay/ai-timeline.service
 */

import { replayRepository } from '../replay.repository';

export async function buildAiTimeline({ signalId }) {
  if (!signalId) {
    return [];
  }

  const parses = await replayRepository.listAiProcessingLogs({ signalId });

  return parses.map((row) => ({
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
      inputText: row.input_text,
      output: row.output,
    },
  }));
}

export async function summarizeAiTimeline({ signalId }) {
  const events = await buildAiTimeline({ signalId });

  if (events.length === 0) {
    return {
      attempts: 0,
      firstAttemptAt: null,
      lastAttemptAt: null,
      averageConfidence: 0,
      averageDurationMs: 0,
      bestConfidence: 0,
    };
  }

  const confidences = events.map((e) => e.details.confidence || 0);
  const durations = events.map((e) => e.details.durationMs || 0);

  const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const averageDurationMs = durations.reduce((a, b) => a + b, 0) / durations.length;
  const bestConfidence = Math.max(...confidences);

  return {
    attempts: events.length,
    firstAttemptAt: events[0].occurredAt,
    lastAttemptAt: events[events.length - 1].occurredAt,
    averageConfidence,
    averageDurationMs,
    bestConfidence,
  };
}

export const aiTimelineService = {
  buildAiTimeline,
  summarizeAiTimeline,
};