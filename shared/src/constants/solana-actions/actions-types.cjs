'use strict';

/**
 * SignalForge - Solana Actions Type Constants
 *
 * Shared between the client and the server. These values describe the
 * Solana Actions specification's structural vocabulary and are safe to
 * expose to the frontend.
 */

const ACTIONS_PROTOCOL_VERSION = '1.0';

const ACTIONS_SPEC_URL = 'https://solana.com/docs/advanced/actions';

const ACTIONS_BASE_PATH = '/api/actions';

const ACTIONS_METHODS = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  OPTIONS: 'OPTIONS',
});

const ACTIONS_SUPPORTED_METHODS = Object.freeze(['GET', 'POST', 'OPTIONS']);

const ACTIONS_CHAIN_IDS = Object.freeze({
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
});

const ACTIONS_LINK_TYPES = Object.freeze({
  TRANSACTION: 'transaction',
  MESSAGE: 'message',
  EXTERNAL_LINK: 'external-link',
});

const ACTIONS_ACTION_TYPES = Object.freeze({
  ACTION: 'action',
  COMPLETED: 'completed',
  MESSAGE: 'message',
});

const ACTIONS_COMMITMENTS = Object.freeze(['processed', 'confirmed', 'finalized']);

const ACTIONS_TEMPLATE_TYPES = Object.freeze({
  SUBSCRIBE: 'subscribe',
  UPGRADE: 'upgrade',
  REFERRAL: 'referral',
  TIP: 'tip',
});

const ACTIONS_BLINK_STATUSES = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
});

const ACTIONS_SHARE_CHANNELS = Object.freeze({
  X: 'x',
  TWITTER: 'twitter',
  TELEGRAM: 'telegram',
  DISCORD: 'discord',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  DIRECT: 'direct',
  EMBED: 'embed',
  QR: 'qr',
});

const ACTIONS_CONVERSION_STATUSES = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

module.exports = Object.freeze({
  ACTIONS_PROTOCOL_VERSION,
  ACTIONS_SPEC_URL,
  ACTIONS_BASE_PATH,
  ACTIONS_METHODS,
  ACTIONS_SUPPORTED_METHODS,
  ACTIONS_CHAIN_IDS,
  ACTIONS_LINK_TYPES,
  ACTIONS_ACTION_TYPES,
  ACTIONS_COMMITMENTS,
  ACTIONS_TEMPLATE_TYPES,
  ACTIONS_BLINK_STATUSES,
  ACTIONS_SHARE_CHANNELS,
  ACTIONS_CONVERSION_STATUSES,
});