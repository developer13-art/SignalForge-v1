/**
 * Presence Service
 *
 * Tracks which users are currently connected. Combines an in-memory
 * map with periodic persistence so online status is available to
 * other services.
 *
 * @module server/realtime/presence/presence.service
 */

import { logger } from '../../lib/logger';
import { presenceRepository } from './presence.repository';

const PRESENCE = new Map();

const PERSIST_INTERVAL_MS = 30000;
let persistTimer = null;

export function markOnline({ userId }) {
  if (!userId) {
    return;
  }

  PRESENCE.set(userId, { status: 'online', lastSeenAt: Date.now() });

  if (!persistTimer) {
    persistTimer = setInterval(() => {
      persistPresence().catch((err) => logger.warn({ err }, 'Presence persist failed'));
    }, PERSIST_INTERVAL_MS);
  }
}

export function markOffline({ userId }) {
  if (!userId) {
    return;
  }

  PRESENCE.set(userId, { status: 'offline', lastSeenAt: Date.now() });
}

export async function persistPresence() {
  for (const [userId, entry] of PRESENCE.entries()) {
    try {
      await presenceRepository.upsertPresence({ userId, status: entry.status });
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to persist presence');
    }
  }
}

export async function getPresence({ userId }) {
  const inMemory = PRESENCE.get(userId);

  if (inMemory) {
    return inMemory;
  }

  const persisted = await presenceRepository.getPresence({ userId });

  if (persisted) {
    return {
      status: persisted.status,
      lastSeenAt: new Date(persisted.last_seen_at).getTime(),
    };
  }

  return null;
}

export function isOnline({ userId }) {
  const entry = PRESENCE.get(userId);
  return Boolean(entry && entry.status === 'online' && Date.now() - entry.lastSeenAt < 2 * 60 * 1000);
}

export async function listOnlineUsers({ limit = 100 }) {
  const inMemory = Array.from(PRESENCE.entries())
    .filter(([, entry]) => entry.status === 'online' && Date.now() - entry.lastSeenAt < 2 * 60 * 1000)
    .map(([userId, entry]) => ({ userId, status: entry.status, lastSeenAt: entry.lastSeenAt }));

  if (inMemory.length > 0) {
    return inMemory.slice(0, limit);
  }

  const persisted = await presenceRepository.listOnlineUsers({ limit });

  return persisted.map((row) => ({
    userId: row.user_id,
    status: row.status,
    lastSeenAt: new Date(row.last_seen_at).getTime(),
  }));
}

export async function stopPresenceService() {
  if (persistTimer) {
    clearInterval(persistTimer);
    persistTimer = null;
  }

  await persistPresence().catch((err) => logger.warn({ err }, 'Final presence persist failed'));
}

export const presenceService = {
  markOnline,
  markOffline,
  persistPresence,
  getPresence,
  isOnline,
  listOnlineUsers,
  stopPresenceService,
};