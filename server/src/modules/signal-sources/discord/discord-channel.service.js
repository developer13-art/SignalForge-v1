/**
 * Discord Channel Service
 *
 * Manages the discovery of text channels inside a guild and the
 * user's explicit opt-in state for each channel. Only explicitly
 * monitored channels are listened to.
 *
 * @module server/modules/signal-sources/discord/discord-channel.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { discordGuildService } from './discord-guild.service';
import {
  emitDiscordChannelOptIn,
  emitDiscordChannelOptOut,
} from './discord.events';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

const TEXT_CHANNEL_TYPES = Object.freeze([0, 5, 10, 11, 12]);

async function discordFetch(path, accessToken) {
  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Discord API ${path} failed with ${response.status}: ${body}`);
  }

  return response.json();
}

export async function discoverChannels({ userId, guildId }) {
  if (!userId || !guildId) {
    throw new AppError('userId and guildId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await discordGuildService.getAccessToken({ userId });

  if (!connection) {
    throw new AppError('Discord connection not found for user', ERROR_CODES.DISCORD_CONNECTION_NOT_FOUND, 404);
  }

  let channels;
  try {
    channels = await discordFetch(`/guilds/${guildId}/channels`, connection.accessToken);
  } catch (err) {
    logger.error({ err, userId, guildId }, 'Failed to fetch Discord channels');
    throw new AppError('Failed to fetch Discord channels', ERROR_CODES.DISCORD_DISCOVERY_FAILED, 502);
  }

  if (!Array.isArray(channels)) {
    channels = [];
  }

  const textChannels = channels.filter((c) => TEXT_CHANNEL_TYPES.includes(c.type));
  const now = nowIso();

  for (const channel of textChannels) {
    await db.query(
      `INSERT INTO discord_channels
         (user_id, guild_id, channel_id, name, type, position, nsfw, monitored, discovered_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE(
         (SELECT monitored FROM discord_channels WHERE user_id = $1 AND channel_id = $3),
         FALSE
       ), $8, $8)
       ON CONFLICT (user_id, channel_id) DO UPDATE
         SET name = EXCLUDED.name,
             type = EXCLUDED.type,
             position = EXCLUDED.position,
             nsfw = EXCLUDED.nsfw,
             updated_at = EXCLUDED.updated_at`,
      [
        userId,
        guildId,
        channel.id,
        channel.name || null,
        channel.type,
        channel.position ?? null,
        Boolean(channel.nsfw),
        now,
      ],
    );
  }

  logger.info({ userId, guildId, channelCount: textChannels.length }, 'Discord channels discovered');

  return textChannels.map((c) => ({
    channelId: c.id,
    name: c.name || null,
    type: c.type,
    position: c.position ?? null,
    nsfw: Boolean(c.nsfw),
  }));
}

export async function listDiscoveredChannels({ userId, guildId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const params = [userId];
  let query = `SELECT guild_id, channel_id, name, type, position, nsfw, monitored, discovered_at, opted_in_at
                 FROM discord_channels
                WHERE user_id = $1`;

  if (guildId) {
    query += ` AND guild_id = $2`;
    params.push(guildId);
  }

  query += ` ORDER BY guild_id ASC, position ASC NULLS LAST`;

  const { rows } = await db.query(query, params);

  return rows.map((row) => ({
    guildId: row.guild_id,
    channelId: row.channel_id,
    name: row.name,
    type: row.type,
    position: row.position,
    nsfw: row.nsfw,
    monitored: row.monitored,
    discoveredAt: row.discovered_at,
    optedInAt: row.opted_in_at,
  }));
}

export async function listMonitoredChannels({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT guild_id, channel_id, name, type
       FROM discord_channels
      WHERE user_id = $1 AND monitored = TRUE
      ORDER BY guild_id ASC, position ASC NULLS LAST`,
    [userId],
  );

  return rows.map((row) => ({
    guildId: row.guild_id,
    channelId: row.channel_id,
    name: row.name,
    type: row.type,
  }));
}

export async function optInChannels({ userId, channelIds }) {
  if (!userId || !Array.isArray(channelIds) || channelIds.length === 0) {
    throw new AppError('userId and non-empty channelIds are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const optedInAt = nowIso();
  const results = [];

  for (const channelId of channelIds) {
    const { rows } = await db.query(
      `UPDATE discord_channels
          SET monitored = TRUE,
              opted_in_at = $1,
              updated_at = $1
        WHERE user_id = $2 AND channel_id = $3
        RETURNING guild_id, channel_id, name`,
      [optedInAt, userId, String(channelId)],
    );

    if (rows[0]) {
      results.push(rows[0]);

      await emitDiscordChannelOptIn({
        userId,
        guildId: rows[0].guild_id,
        channelId: rows[0].channel_id,
        channelName: rows[0].name,
      }).catch((err) => logger.warn({ err }, 'Failed to emit Discord channel opt-in event'));
    }
  }

  logger.info({ userId, optedInCount: results.length }, 'Discord channels opted in');

  return { optedIn: results };
}

export async function optOutChannels({ userId, channelIds }) {
  if (!userId || !Array.isArray(channelIds) || channelIds.length === 0) {
    throw new AppError('userId and non-empty channelIds are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const results = [];

  for (const channelId of channelIds) {
    const { rows } = await db.query(
      `UPDATE discord_channels
          SET monitored = FALSE,
              opted_in_at = NULL,
              updated_at = $1
        WHERE user_id = $2 AND channel_id = $3
        RETURNING guild_id, channel_id, name`,
      [nowIso(), userId, String(channelId)],
    );

    if (rows[0]) {
      results.push(rows[0]);

      await emitDiscordChannelOptOut({
        userId,
        guildId: rows[0].guild_id,
        channelId: rows[0].channel_id,
      }).catch((err) => logger.warn({ err }, 'Failed to emit Discord channel opt-out event'));
    }
  }

  logger.info({ userId, optedOutCount: results.length }, 'Discord channels opted out');

  return { optedOut: results };
}

export async function removeAllChannels({ userId }) {
  if (!userId) {
    return;
  }
  await db.query(`DELETE FROM discord_channels WHERE user_id = $1`, [userId]);
}

export async function countMonitoredChannels({ userId }) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM discord_channels
      WHERE user_id = $1 AND monitored = TRUE`,
    [userId],
  );
  return rows[0]?.count ?? 0;
}

export const discordChannelService = {
  discoverChannels,
  listDiscoveredChannels,
  listMonitoredChannels,
  optInChannels,
  optOutChannels,
  removeAllChannels,
  countMonitoredChannels,
};