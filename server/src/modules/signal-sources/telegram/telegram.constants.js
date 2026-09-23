/**
 * Telegram Integration Constants
 *
 * @module signalforge/server/modules/signal-sources/telegram/constants
 */

export const TELEGRAM_EVENTS = Object.freeze({
  LOGIN_STARTED: 'telegram.login.started',
  LOGIN_OTP_SENT: 'telegram.login.otp_sent',
  LOGIN_OTP_VERIFIED: 'telegram.login.otp_verified',
  LOGIN_2FA_REQUIRED: 'telegram.login.2fa_required',
  LOGIN_COMPLETED: 'telegram.login.completed',
  LOGIN_FAILED: 'telegram.login.failed',
  SESSION_EXPIRED: 'telegram.session.expired',
  SESSION_REVOKED: 'telegram.session.revoked',
  CHANNEL_DISCOVERED: 'telegram.channel.discovered',
  CHANNEL_OPTED_IN: 'telegram.channel.opted_in',
  CHANNEL_OPTED_OUT: 'telegram.channel.opted_out',
  MESSAGE_RECEIVED: 'telegram.message.received',
  MESSAGE_EDITED: 'telegram.message.edited',
  MESSAGE_DELETED: 'telegram.message.deleted',
  LISTENER_STARTED: 'telegram.listener.started',
  LISTENER_STOPPED: 'telegram.listener.stopped',
  LISTENER_ERROR: 'telegram.listener.error',
});

export const TELEGRAM_LOGIN_STATES = Object.freeze({
  IDLE: 'IDLE',
  AWAITING_PHONE: 'AWAITING_PHONE',
  AWAITING_OTP: 'AWAITING_OTP',
  AWAITING_PASSWORD: 'AWAITING_PASSWORD',
  AUTHENTICATED: 'AUTHENTICATED',
  EXPIRED: 'EXPIRED',
});

export const TELEGRAM_SESSION_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
  ERROR: 'ERROR',
});

export const OTP_EXPIRY_MINUTES = 5;
export const MAX_OTP_ATTEMPTS = 3;
export const SESSION_HEALTH_CHECK_INTERVAL_MS = 60000;
export const RECONNECT_BASE_DELAY_MS = 5000;
export const MAX_RECONNECT_ATTEMPTS = 10;