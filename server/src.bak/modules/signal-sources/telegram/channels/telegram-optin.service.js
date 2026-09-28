/**
 * Telegram Opt-In Service
 *
 * Enforces the platform rule that only explicitly selected Telegram
 * channels are monitored. Provides higher-level operations that wrap
 * the channel repository and validate the user's subscription and
 * channel limits before applying opt-in state.
 *
 * @module server/modules/signal-sources/telegram/channels/telegram-optin.service
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { telegramChannelService } from './telegram-channel.service';
import * as repository from './telegram-channel.repository';

const DEFAULT_MAX_MONITORED_CHANNELS = 50;

export async function applyOptIn({ userId, channelIds, limit }) {
  if (!userId || !Array.isArray(channelIds)) {
    throw new AppError(
      'userId and channelIds are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const maxMonitored = limit ?? DEFAULT_MAX_MONITORED_CHANNELS;
  const currentCount = await repository.countMonitoredChannels({ userId });

  const discovered = await repository.listDiscoveredChannels({ userId });
  const discoveredIds = new Set(discovered.map((row) => row.channel_id));

  const valid = [];
  const invalid = [];
  const alreadyMonitored = new Set(
    discovered.filter((row) => row.monitored).map((row) => row.channel_id),
  );

  for (const id of channelIds) {
    const stringId = String(id);
    if (!discoveredIds.has(stringId)) {
      invalid.push(stringId);
    } else if (!alreadyMonitored.has(stringId)) {
      valid.push(stringId);
    }
  }

  if (invalid.length > 0) {
    throw new AppError(
      `The following channels were not discovered for this account: ${invalid.join(', ')}`,
      ERROR_CODES.TELEGRAM_CHANNEL_INVALID,
      400,
    );
  }

  if (currentCount + valid.length > maxMonitored) {
    throw new AppError(
      `Cannot monitor more than ${maxMonitored} channels`,
      ERROR_CODES.TELEGRAM_CHANNEL_LIMIT_EXCEEDED,
      400,
    );
  }

  const result = await telegramChannelService.optInChannels({
    userId,
    channelIds: valid,
  });

  logger.info(
    { userId, optedIn: result.optedIn.length, skipped: channelIds.length - valid.length },
    'Telegram opt-in applied',
  );

  return result;
}

export async function applyOptOut({ userId, channelIds }) {
  return telegramChannelService.optOutChannels({ userId, channelIds });
}

export async function getOptInStatus({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const discovered = await repository.listDiscoveredChannels({ userId });

  return {
    total: discovered.length,
    monitored: discovered.filter((row) => row.monitored).length,
    channels: discovered.map((row) => ({
      channelId: row.channel_id,
      title: row.title,
      monitored: row.monitored,
    })),
  };
}

export const telegramOptInService = {
  applyOptIn,
  applyOptOut,
  getOptInStatus,
};