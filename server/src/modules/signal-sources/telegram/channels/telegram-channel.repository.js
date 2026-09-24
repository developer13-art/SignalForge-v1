/**
 * Telegram Channel Repository
 *
 * Persistence layer for Telegram channels that have been discovered
 * for a user's Telegram session and for the monitoring opt-in state.
 *
 * @module server/modules/signal-sources/telegram/channels/telegram-channel.repository
 */

import { db } from '../../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function upsertDiscoveredChannels({ userId, channels, discoveredAt }) {
  if (!channels || channels.length === 0) {
    return;
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    for (const channel of channels) {
      await client.query(
        `INSERT INTO telegram_channels
           (user_id, channel_id, title, type, username, participants_count,
            monitored, discovered_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE(
           (SELECT monitored FROM telegram_channels WHERE user_id = $1 AND channel_id = $2),
           FALSE
         ), $7, $7)
         ON CONFLICT (user_id, channel_id) DO UPDATE
           SET title = EXCLUDED.title,
               type = EXCLUDED.type,
               username = EXCLUDED.username,
               participants_count = EXCLUDED.participants_count,
               discovered_at = EXCLUDED.discovered_at,
               updated_at = EXCLUDED.updated_at`,
        [
          userId,
          channel.channelId,
          channel.title,
          channel.type,
          channel.username,
          channel.participantsCount,
          discoveredAt,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function listMonitoredChannels({ userId }) {
  const { rows } = await db.query(
    `SELECT channel_id, title, type, monitored, opted_in_at
       FROM telegram_channels
      WHERE user_id = $1 AND monitored = TRUE
      ORDER BY title ASC NULLS LAST`,
    [userId],
  );
  return rows;
}

export async function listDiscoveredChannels({ userId }) {
  const { rows } = await db.query(
    `SELECT channel_id, title, type, username, participants_count,
            monitored, discovered_at, opted_in_at
       FROM telegram_channels
      WHERE user_id = $1
      ORDER BY monitored DESC, title ASC NULLS LAST`,
    [userId],
  );
  return rows;
}

export async function markChannelMonitored({ userId, channelId, monitored, optedInAt }) {
  const { rows } = await db.query(
    `UPDATE telegram_channels
        SET monitored = $1,
            opted_in_at = $2,
            updated_at = $3
      WHERE user_id = $4 AND channel_id = $5
      RETURNING channel_id, title, monitored, opted_in_at`,
    [monitored, optedInAt, nowIso(), userId, channelId],
  );
  return rows[0] || null;
}

export async function deleteChannelsForUser({ userId }) {
  await db.query(`DELETE FROM telegram_channels WHERE user_id = $1`, [userId]);
}

export async function countMonitoredChannels({ userId }) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM telegram_channels
      WHERE user_id = $1 AND monitored = TRUE`,
    [userId],
  );
  return rows[0]?.count ?? 0;
}