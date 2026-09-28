/**
 * Event Reconstructor Service
 *
 * Reconstructs a sequence of platform events from the event store by
 * correlation id, walking causation chains when necessary.
 *
 * @module server/modules/replay/system-timeline/event-reconstructor.service
 */

import { replayRepository } from '../replay.repository';

export async function reconstructByCorrelation({ correlationId }) {
  if (!correlationId) {
    return [];
  }

  const events = await replayRepository.listSystemEvents({ correlationId });

  return events.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    source: row.source,
    actorId: row.actor_id,
    actorType: row.actor_type,
    payload: row.payload,
    correlationId: row.correlation_id,
    causationId: row.causation_id,
    occurredAt: row.created_at,
  }));
}

export function buildCausationChain({ events }) {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }

  const byId = new Map();
  for (const event of events) {
    byId.set(event.id, { event, children: [] });
  }

  const roots = [];

  for (const event of events) {
    const node = byId.get(event.id);
    if (event.causationId && byId.has(event.causationId)) {
      byId.get(event.causationId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function flattenChain({ roots }) {
  const result = [];

  function walk(node) {
    if (!node) {
      return;
    }
    result.push(node.event);
    for (const child of node.children) {
      walk(child);
    }
  }

  for (const root of roots) {
    walk(root);
  }

  return result;
}

export const eventReconstructorService = {
  reconstructByCorrelation,
  buildCausationChain,
  flattenChain,
};