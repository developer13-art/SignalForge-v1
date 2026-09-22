/**
 * JWT Configuration
 *
 * Configures JSON Web Token issuance and validation for SignalForge.
 *
 * @module signalforge/server/config/jwt
 */

function required(name, value) {
  if (value !== undefined && value !== null && value !== '') {
    return value;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const jwtConfig = Object.freeze({
  secret: required('JWT_SECRET', process.env.JWT_SECRET),
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  issuer: process.env.JWT_ISSUER || 'signalforge',
  audience: process.env.JWT_AUDIENCE || 'signalforge-api',
  algorithm: 'HS256',

  accessToken: {
    headerName: 'authorization',
    headerPrefix: 'Bearer ',
  },

  refreshToken: {
    cookieName: 'signalforge_refresh_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAgeMs: toNumber(process.env.JWT_REFRESH_MAX_AGE_MS, 30 * 24 * 60 * 60 * 1000),
  },

  passwordResetToken: {
    expiresInMinutes: toNumber(process.env.JWT_PASSWORD_RESET_EXPIRES_MINUTES, 30),
  },

  emailVerificationToken: {
    expiresInHours: toNumber(process.env.JWT_EMAIL_VERIFICATION_EXPIRES_HOURS, 24),
  },

  phoneVerificationToken: {
    expiresInMinutes: toNumber(process.env.JWT_PHONE_VERIFICATION_EXPIRES_MINUTES, 10),
  },

  twoFactorChallengeToken: {
    expiresInMinutes: toNumber(process.env.JWT_TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES, 5),
  },

  apiKeyPrefix: 'sf_',
  apiKeyLength: toNumber(process.env.API_KEY_LENGTH, 48),

  clockToleranceSeconds: toNumber(process.env.JWT_CLOCK_TOLERANCE_SECONDS, 5),
});

export default jwtConfig;