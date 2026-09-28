/**
 * Discord Events
 *
 * Defines Discord-specific event names and helpers for publishing
 * Discord integration events on the platform Event Bus.
 *
 * @module server/modules/signal-sources/discord/discord.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { publishEvent } from '../../../events/event-publisher';

const SOURCE = 'discord.events';

export async function emitDiscordOAuthInitiated({ userId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_INITIATED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      initiatedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordOAuthConnected({ userId, discordUserId, guildCount }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      discordUserId,
      guildCount,
      connectedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordOAuthRevoked({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_REVOKED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      reason: reason || null,
      revokedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordGuildDiscovered({ userId, guildCount }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNELS_DISCOVERED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      guildCount,
      discoveredAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordChannelOptIn({ userId, guildId, channelId, channelName }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      guildId,
      channelId,
      channelName: channelName || null,
      optedInAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordChannelOptOut({ userId, guildId, channelId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      guildId,
      channelId,
      optedOutAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordListenerStarted({ userId, guildCount, channelCount }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_LISTENER_STARTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      guildCount,
      channelCount,
      startedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordListenerStopped({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_LISTENER_STOPPED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      reason: reason || null,
      stoppedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordWebhookReceived({ userId, guildId, channelId, messageId }) {
  return publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      guildId,
      channelId,
      externalMessageId: messageId,
      receivedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordWebhookRejected({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      reason: reason || null,
      rejectedAt: new Date().toISOString(),
    },
  });
}

export async function emitDiscordHealthCheck({ userId, healthy, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_HEALTH_CHECK,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.DISCORD,
      userId,
      healthy,
      details: details || null,
      checkedAt: new Date().toISOString(),
    },
  });
}

export const DISCORD_EVENT_NAMES = Object.freeze({
  OAUTH_INITIATED: EVENT_TYPES.SOURCE_SESSION_INITIATED,
  OAUTH_CONNECTED: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
  OAUTH_REVOKED: EVENT_TYPES.SOURCE_SESSION_REVOKED,
  GUILD_DISCOVERED: EVENT_TYPES.SOURCE_CHANNELS_DISCOVERED,
  CHANNEL_OPT_IN: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
  CHANNEL_OPT_OUT: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
  LISTENER_STARTED: EVENT_TYPES.SOURCE_LISTENER_STARTED,
  LISTENER_STOPPED: EVENT_TYPES.SOURCE_LISTENER_STOPPED,
  WEBHOOK_RECEIVED: EVENT_TYPES.MESSAGE_RECEIVED,
  WEBHOOK_REJECTED: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
  HEALTH_CHECK: EVENT_TYPES.SOURCE_HEALTH_CHECK,
});