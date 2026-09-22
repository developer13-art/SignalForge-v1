/**
 * Security Configuration
 *
 * Configures security-related controls including encryption,
 * secrets, sessions, and audit logging.
 *
 * @module signalforge/server/config/security
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

const securityConfig = Object.freeze({
  encryption: {
    key: process.env.ENCRYPTION_KEY || null,
    algorithm: 'aes-256-gcm',
    ivLength: 12,
    authTagLength: 16,
    keyLength: 32,
  },

  hashing: {
    algorithm: 'sha256',
    saltRounds: toNumber(process.env.HASH_SALT_ROUNDS, 12),
  },

  passwordPolicy: {
    minLength: toNumber(process.env.PASSWORD_MIN_LENGTH, 8),
    maxLength: toNumber(process.env.PASSWORD_MAX_LENGTH, 128),
    requireLowercase: true,
    requireUppercase: true,
    requireDigit: true,
    requireSpecial: true,
    rejectCommon: true,
    rejectRepeating: true,
    rejectSequential: true,
  },

  twoFactor: {
    enabled: toBoolean(process.env.TWO_FACTOR_ENABLED, true),
    issuer: process.env.TWO_FACTOR_ISSUER || 'SignalForge',
    algorithm: 'sha1',
    digits: 6,
    step: 30,
    window: 1,
    backupCodesCount: toNumber(process.env.TWO_FACTOR_BACKUP_CODES, 10),
  },

  session: {
    maxConcurrentSessions: toNumber(process.env.MAX_CONCURRENT_SESSIONS, 10),
    idleTimeoutMinutes: toNumber(process.env.SESSION_IDLE_TIMEOUT_MINUTES, 30),
    absoluteTimeoutHours: toNumber(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS, 720),
    rotateOnPrivilegeChange: true,
    terminateOthersOnPasswordChange: true,
  },

  apiKey: {
    prefix: 'sf_',
    length: toNumber(process.env.API_KEY_LENGTH, 48),
    hashAlgorithm: 'sha256',
    defaultExpiryDays: toNumber(process.env.API_KEY_DEFAULT_EXPIRY_DAYS, 365),
    maxKeysPerUser: toNumber(process.env.API_KEY_MAX_PER_USER, 10),
  },

  audit: {
    enabled: toBoolean(process.env.AUDIT_ENABLED, true),
    retentionDays: toNumber(process.env.AUDIT_RETENTION_DAYS, 365),
    logFailures: true,
    logReads: toBoolean(process.env.AUDIT_LOG_READS, false),
  },

  threatDetection: {
    enabled: toBoolean(process.env.THREAT_DETECTION_ENABLED, true),
    failedLoginThreshold: toNumber(process.env.THREAT_FAILED_LOGIN_THRESHOLD, 5),
    failedLoginWindowMinutes: toNumber(process.env.THREAT_FAILED_LOGIN_WINDOW_MINUTES, 15),
    lockoutDurationMinutes: toNumber(process.env.THREAT_LOCKOUT_MINUTES, 30),
    suspiciousIpThreshold: toNumber(process.env.THREAT_SUSPICIOUS_IP_THRESHOLD, 20),
    notifyOnLockout: true,
  },

  headers: {
    hsts: {
      enabled: toBoolean(process.env.HSTS_ENABLED, true),
      maxAge: toNumber(process.env.HSTS_MAX_AGE, 31536000),
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      enabled: toBoolean(process.env.CSP_ENABLED, true),
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xXssProtection: '1; mode=block',
    permissionsPolicy: {
      camera: ["'self'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'self'"],
    },
  },

  secrets: {
    provider: process.env.SECRETS_PROVIDER || 'env',
    vaultUrl: process.env.VAULT_URL || null,
    vaultToken: process.env.VAULT_TOKEN || null,
    awsRegion: process.env.AWS_REGION || null,
    awsSecretId: process.env.AWS_SECRET_ID || null,
  },
});

export default securityConfig;