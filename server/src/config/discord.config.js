/**
 * Discord Configuration
 *
 * Configures Discord integration for signal ingestion.
 *
 * @module signalforge/server/config/discord
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const discordConfig = Object.freeze({
  enabled: toBoolean(process.env.DISCORD_ENABLED, true),

  clientId: process.env.DISCORD_CLIENT_ID || null,
  clientSecret: process.env.DISCORD_CLIENT_SECRET || null,
  botToken: process.env.DISCORD_BOT_TOKEN || null,

  redirectUri:
    process.env.DISCORD_REDIRECT_URI ||
    'http://localhost:4000/api/sources/discord/callback',

  baseUrl: 'https://discord.com/api/v10',
  gatewayUrl: 'wss://gateway.discord.gg',
  gatewayVersion: 10,

  scopes: ['identify', 'guilds', 'guilds.messages.read', 'bot'],

  bot: {
    enabled: toBoolean(process.env.DISCORD_BOT_ENABLED, true),
    intents: [
      'GUILDS',
      'GUILD_MESSAGES',
      'GUILD_MESSAGE_REACTIONS',
      'DIRECT_MESSAGES',
      'MESSAGE_CONTENT',
    ],
    permissions: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
  },

  discovery: {
    batchSize: toNumber(process.env.DISCORD_DISCOVERY_BATCH_SIZE, 100),
    maxGuildsPerUser: toNumber(process.env.DISCORD_MAX_GUILDS_PER_USER, 25),
    maxChannelsPerGuild: toNumber(process.env.DISCORD_MAX_CHANNELS_PER_GUILD, 100),
    allowDms: false,
  },

  listener: {
    enabled: toBoolean(process.env.DISCORD_LISTENER_ENABLED, true),
    reconnect: true,
    reconnectDelayMs: toNumber(process.env.DISCORD_RECONNECT_DELAY_MS, 5000),
    maxReconnectAttempts: toNumber(process.env.DISCORD_MAX_RECONNECT_ATTEMPTS, 10),
    processEdits: toBoolean(process.env.DISCORD_PROCESS_EDITS, true),
    processDeletes: toBoolean(process.env.DISCORD_PROCESS_DELETES, true),
    processMedia: toBoolean(process.env.DISCORD_PROCESS_MEDIA, true),
  },

  message: {
    maxTextLength: toNumber(process.env.DISCORD_MAX_TEXT_LENGTH, 2000),
    maxMediaSizeBytes: toNumber(process.env.DISCORD_MAX_MEDIA_SIZE, 8 * 1024 * 1024),
    supportedMediaTypes: ['image', 'video', 'audio', 'file'],
    preserveRawPayload: toBoolean(process.env.DISCORD_PRESERVE_RAW, true),
  },

  rateLimit: {
    requestsPerSecond: toNumber(process.env.DISCORD_RATE_LIMIT_PER_SECOND, 50),
    requestsPerMinute: toNumber(process.env.DISCORD_RATE_LIMIT_PER_MINUTE, 1000),
  },

  webhook: {
    verifySignature: true,
    publicKey: process.env.DISCORD_PUBLIC_KEY || null,
  },
});

export default discordConfig;