/**
 * Telegram Discovery Service
 *
 * Handles periodic rediscovery of a user's Telegram channels. This
 * keeps the local channel list in sync with channels the user joins
 * or leaves on Telegram, without requiring the user to reconnect.
 *
 * @module server/modules/signal-sources/telegram/channels/telegram-discovery.service
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { telegramChannelService } from './telegram-channel.service';
import { telegramSessionService } from '../session/telegram-session.service';

const DISCOVERY_MIN_INTERVAL_MS = 5 * 60 * 1000;

const lastDiscoveryAt = new Map();

export async function refreshDiscoveredChannels({ userId, force = false }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const last = lastDiscoveryAt.get(userId) || 0;
  const now = Date.now();

  if (!force && now - last < DISCOVERY_MIN_INTERVAL_MS) {
    logger.debug({ userId }, 'Skipping channel discovery due to rate limit');
    return { skipped: true, reason: 'RATE_LIMIT' };
  }

  const session = await telegramSessionService.getActiveSession({ userId });

  if (!session) {
    return { skipped: true, reason: 'NO_ACTIVE_SESSION' };
  }

  try {
    const channels = await telegramChannelService.discoverChannels({ userId });
    lastDiscoveryAt.set(userId, now);
    return { skipped: false, channelCount: channels.length };
  } catch (err) {
    logger.error({ err, userId }, 'Telegram channel rediscovery failed');
    throw new AppError(
      'Telegram channel rediscovery failed',
      ERROR_CODES.TELEGRAM_DISCOVERY_FAILED,
      502,
    );
  }
}

export async function refreshAllUsers() {
  const sessions = await telegramSessionService.listActiveSessions();

  const results = [];
  for (const session of sessions) {
    try {
      const result = await refreshDiscoveredChannels({ userId: session.user_id });
      results.push({ userId: session.user_id, ...result });
    } catch (err) {
      results.push({ userId: session.user_id, skipped: false, error: err.message });
    }
  }

  logger.info({ userCount: results.length }, 'Telegram channel rediscovery sweep complete');

  return results;
}

export function resetDiscoveryRateLimit({ userId }) {
  if (userId) {
    lastDiscoveryAt.delete(userId);
  } else {
    lastDiscoveryAt.clear();
  }
}

export const telegramDiscoveryService = {
  refreshDiscoveredChannels,
  refreshAllUsers,
  resetDiscoveryRateLimit,
};