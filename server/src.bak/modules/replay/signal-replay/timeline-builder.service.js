/**
 * Timeline Builder Service
 *
 * Utility for merging multiple sorted event streams into a single
 * chronological timeline.
 *
 * @module server/modules/replay/signal-replay/timeline-builder.service
 */

export function mergeEvents({ streams }) {
  if (!Array.isArray(streams)) {
    return [];
  }

  const merged = [];

  for (const stream of streams) {
    if (!Array.isArray(stream)) {
      continue;
    }
    for (const event of stream) {
      merged.push(event);
    }
  }

  merged.sort((a, b) => {
    const aTime = new Date(a.occurredAt || a.createdAt || a.created_at).getTime();
    const bTime = new Date(b.occurredAt || b.createdAt || b.created_at).getTime();
    return aTime - bTime;
  });

  return merged;
}

export function normalizeEvent({ event, source }) {
  if (!event) {
    return null;
  }

  const occurredAt =
    event.occurredAt ||
    event.createdAt ||
    event.created_at ||
    event.timestamp ||
    new Date().toISOString();

  return {
    id: event.id || null,
    source: source || 'unknown',
    eventType: event.eventType || event.event_type || null,
    actorType: event.actorType || event.actor_type || null,
    actorId: event.actorId || event.actor_id || null,
    occurredAt,
    details: event.details || event.payload || null,
  };
}

export function groupByActor({ events }) {
  const groups = {};

  for (const event of events) {
    const key = event.actorType || 'UNKNOWN';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
  }

  return groups;
}

export function calculateDurations({ events }) {
  const durations = [];

  for (let i = 1; i < events.length; i++) {
    const previous = events[i - 1];
    const current = events[i];

    const previousTime = new Date(previous.occurredAt).getTime();
    const currentTime = new Date(current.occurredAt).getTime();

    durations.push({
      fromEvent: previous.eventType,
      toEvent: current.eventType,
      durationMs: currentTime - previousTime,
    });
  }

  return durations;
}

export function buildTimelineSummary({ events }) {
  if (!Array.isArray(events) || events.length === 0) {
    return {
      totalEvents: 0,
      firstEventAt: null,
      lastEventAt: null,
      totalDurationMs: 0,
      eventTypes: {},
    };
  }

  const eventTypes = {};
  for (const event of events) {
    if (event.eventType) {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    }
  }

  const firstEventAt = events[0].occurredAt;
  const lastEventAt = events[events.length - 1].occurredAt;
  const totalDurationMs =
    new Date(lastEventAt).getTime() - new Date(firstEventAt).getTime();

  return {
    totalEvents: events.length,
    firstEventAt,
    lastEventAt,
    totalDurationMs,
    eventTypes,
  };
}

export const timelineBuilderService = {
  mergeEvents,
  normalizeEvent,
  groupByActor,
  calculateDurations,
  buildTimelineSummary,
};