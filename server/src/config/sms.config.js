/**
 * SMS Configuration
 *
 * Configures SMS delivery providers for SignalForge.
 *
 * @module signalforge/server/config/sms
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

const smsConfig = Object.freeze({
  enabled: toBoolean(process.env.SMS_ENABLED, true),
  provider: process.env.SMS_PROVIDER || 'twilio',

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || null,
    authToken: process.env.TWILIO_AUTH_TOKEN || null,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || null,
    statusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL || null,
  },

  defaultCountryCode: process.env.SMS_DEFAULT_COUNTRY_CODE || '+1',

  rateLimit: {
    perNumberPerMinute: toNumber(process.env.SMS_RATE_LIMIT_PER_NUMBER_PER_MINUTE, 5),
    perNumberPerDay: toNumber(process.env.SMS_RATE_LIMIT_PER_NUMBER_PER_DAY, 20),
    globalPerSecond: toNumber(process.env.SMS_RATE_LIMIT_GLOBAL_PER_SECOND, 50),
  },

  retry: {
    maxAttempts: toNumber(process.env.SMS_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.SMS_RETRY_BASE_DELAY_MS, 2000),
  },

  otp: {
    codeLength: toNumber(process.env.SMS_OTP_CODE_LENGTH, 6),
    expiresInMinutes: toNumber(process.env.SMS_OTP_EXPIRES_MINUTES, 10),
    maxAttempts: toNumber(process.env.SMS_OTP_MAX_ATTEMPTS, 5),
  },

  templates: {
    otp: 'Your SignalForge verification code is {code}. It expires in {minutes} minutes.',
    securityAlert:
      'SignalForge security alert: {message}. If this was not you, contact support immediately.',
  },
});

export default smsConfig;