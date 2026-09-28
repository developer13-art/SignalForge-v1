/**
 * Discord Guild Service
 *
 * Manages the list of Discord guilds a user has authorized
 * SignalForge to access via OAuth. Provides discovery, listing, and
 * removal of guilds, and stores an encrypted access token per user so
 * later operations can call the Discord API.
 *
 * @module server/modules/signal-sources/discord/discord-guild.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { encryptPacked, decryptPacked } from '@signalforge/shared/utils/crypto.util';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import {
  emitDiscordOAuthConnected,
  emitDiscordOAuthRevoked,
  emitDiscordGuildDiscovered,
} from './discord.events';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

function getEncryptionKey() {
  const key = config.discord?.sessionEncryptionKey || config.security?.encryptionKey;
  if (!key) {
    throw new AppError('Discord session encryption key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return key;
}

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

export async function exchangeOAuthCode({ userId, code, redirectUri }) {
  if (!userId || !code) {
    throw new AppError('userId and code are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!config.discord?.clientId || !config.discord?.clientSecret) {
    throw new AppError('Discord OAuth is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  const body = new URLSearchParams({
    client_id: config.discord.clientId,
    client_secret: config.discord.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri || config.discord.redirectUri,
  });

  let tokenResponse;
  try {
    const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Discord OAuth token exchange failed: ${response.status} ${errorBody}`);
    }

    tokenResponse = await response.json();
  } catch (err) {
    logger.error({ err, userId }, 'Discord OAuth token exchange failed');
    throw new AppError('Discord OAuth token exchange failed', ERROR_CODES.DISCORD_OAUTH_FAILED, 502);
  }

  const accessToken = tokenResponse.access_token;
  const refreshToken = tokenResponse.refresh_token || null;
  const expiresIn = tokenResponse.expires_in || 604800;
  const scope = tokenResponse.scope || 'identify guilds';

  if (!accessToken) {
    throw new AppError('Discord did not return an access token', ERROR_CODES.DISCORD_OAUTH_FAILED, 502);
  }

  const encryptionKey = getEncryptionKey();
  const accessTokenCipher = encryptPacked(accessToken, encryptionKey);
  const refreshTokenCipher = refreshToken ? encryptPacked(refreshToken, encryptionKey) : null;

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { rows } = await db.query(
    `INSERT INTO discord_connections
       (user_id, access_token_cipher, refresh_token_cipher, scope, expires_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT (user_id) DO UPDATE
       SET access_token_cipher = EXCLUDED.access_token_cipher,
           refresh_token_cipher = EXCLUDED.refresh_token_cipher,
           scope = EXCLUDED.scope,
           expires_at = EXCLUDED.expires_at,
           updated_at = EXCLUDED.updated_at
     RETURNING id`,
    [userId, accessTokenCipher, refreshTokenCipher, scope, expiresAt, nowIso()],
  );

  const connectionId = rows[0]?.id;

  let userProfile = null;
  try {
    userProfile = await discordFetch('/users/@me', accessToken);
  } catch (err) {
    logger.warn({ err, userId }, 'Failed to fetch Discord user profile');
  }

  const guilds = await discoverGuilds({ userId, accessToken });

  await emitDiscordOAuthConnected({
    userId,
    discordUserId: userProfile ? userProfile.id : null,
    guildCount: guilds.length,
  }).catch((err) => logger.warn({ err }, 'Failed to emit Discord OAuth connected event'));

  return {
    connectionId,
    discordUserId: userProfile ? userProfile.id : null,
    discordUsername: userProfile ? (userProfile.username || null) : null,
    guildCount: guilds.length,
  };
}

export async function discoverGuilds({ userId, accessToken }) {
  if (!userId || !accessToken) {
    throw new AppError('userId and accessToken are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let guilds;
  try {
    guilds = await discordFetch('/users/@me/guilds', accessToken);
  } catch (err) {
    logger.error({ err, userId }, 'Failed to fetch Discord guilds');
    throw new AppError('Failed to fetch Discord guilds', ERROR_CODES.DISCORD_DISCOVERY_FAILED, 502);
  }

  if (!Array.isArray(guilds)) {
    guilds = [];
  }

  const now = nowIso();

  for (const guild of guilds) {
    const isManageable = (BigInt(guild.permissions || '0') & BigInt(0x20)) === BigInt(0x20) || guild.owner === true;

    await db.query(
      `INSERT INTO discord_guilds
         (user_id, guild_id, name, icon, owner, permissions, manageable, discovered_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       ON CONFLICT (user_id, guild_id) DO UPDATE
         SET name = EXCLUDED.name,
             icon = EXCLUDED.icon,
             owner = EXCLUDED.owner,
             permissions = EXCLUDED.permissions,
             manageable = EXCLUDED.manageable,
             updated_at = EXCLUDED.updated_at`,
      [
        userId,
        guild.id,
        guild.name || null,
        guild.icon || null,
        Boolean(guild.owner),
        guild.permissions || null,
        isManageable,
        now,
      ],
    );
  }

  await emitDiscordGuildDiscovered({
    userId,
    guildCount: guilds.length,
  }).catch((err) => logger.warn({ err }, 'Failed to emit Discord guild discovered event'));

  logger.info({ userId, guildCount: guilds.length }, 'Discord guilds discovered');

  return guilds.map((g) => ({
    guildId: g.id,
    name: g.name || null,
    icon: g.icon || null,
    owner: Boolean(g.owner),
    permissions: g.permissions || null,
  }));
}

export async function listConnectedGuilds({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT guild_id, name, icon, owner, permissions, manageable, discovered_at, updated_at
       FROM discord_guilds
      WHERE user_id = $1
      ORDER BY name ASC NULLS LAST`,
    [userId],
  );

  return rows.map((row) => ({
    guildId: row.guild_id,
    name: row.name,
    icon: row.icon,
    owner: row.owner,
    permissions: row.permissions,
    manageable: row.manageable,
    discoveredAt: row.discovered_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAccessToken({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, access_token_cipher, refresh_token_cipher, scope, expires_at
       FROM discord_connections
      WHERE user_id = $1
      LIMIT 1`,
    [userId],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  const encryptionKey = getEncryptionKey();

  let accessToken;
  try {
    accessToken = decryptPacked(row.access_token_cipher, encryptionKey);
  } catch (err) {
    logger.error({ err, userId }, 'Failed to decrypt Discord access token');
    throw new AppError('Discord access token could not be decrypted', ERROR_CODES.DISCORD_DECRYPT_FAILED, 500);
  }

  return {
    connectionId: row.id,
    accessToken,
    scope: row.scope,
    expiresAt: row.expires_at,
  };
}

export async function revokeConnection({ userId, reason }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await getAccessToken({ userId }).catch(() => null);

  if (connection && connection.accessToken) {
    try {
      await fetch(`${DISCORD_API_BASE}/oauth2/token/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: connection.accessToken,
          client_id: config.discord?.clientId || '',
          client_secret: config.discord?.clientSecret || '',
        }).toString(),
      });
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to revoke Discord token remotely');
    }
  }

  await db.query(`DELETE FROM discord_connections WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM discord_guilds WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM discord_channels WHERE user_id = $1`, [userId]);

  await emitDiscordOAuthRevoked({ userId, reason }).catch((err) => logger.warn({ err }, 'Failed to emit Discord OAuth revoked event'));

  logger.info({ userId }, 'Discord connection revoked');

  return { revoked: true };
}

export async function listAllConnectedUserIds() {
  const { rows } = await db.query(
    `SELECT user_id
       FROM discord_connections
      WHERE expires_at > $1`,
    [nowIso()],
  );
  return rows.map((row) => row.user_id);
}

export const discordGuildService = {
  exchangeOAuthCode,
  discoverGuilds,
  listConnectedGuilds,
  getAccessToken,
  revokeConnection,
  listAllConnectedUserIds,
};