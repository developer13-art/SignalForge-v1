/**
 * Storage Configuration
 *
 * Configures S3-compatible object storage for KYC documents, media,
 * reports, and other files. Identity documents are stored privately
 * and are never publicly accessible.
 *
 * @module signalforge/server/config/storage
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

const storageConfig = Object.freeze({
  enabled: toBoolean(process.env.STORAGE_ENABLED, true),
  driver: process.env.STORAGE_DRIVER || 's3',

  s3: {
    bucket: process.env.STORAGE_BUCKET || 'signalforge-private',
    region: process.env.STORAGE_REGION || 'us-east-1',
    accessKeyId: process.env.STORAGE_ACCESS_KEY || null,
    secretAccessKey: process.env.STORAGE_SECRET_KEY || null,
    endpoint: process.env.STORAGE_ENDPOINT || null,
    forcePathStyle: toBoolean(process.env.STORAGE_FORCE_PATH_STYLE, true),
    signatureVersion: process.env.STORAGE_SIGNATURE_VERSION || 'v4',
  },

  local: {
    root: process.env.STORAGE_LOCAL_ROOT || './storage/private',
    baseUrl: process.env.STORAGE_LOCAL_URL || null,
  },

  signedUrl: {
    ttlSeconds: toNumber(process.env.STORAGE_SIGNED_URL_TTL, 900),
    maxTtlSeconds: toNumber(process.env.STORAGE_SIGNED_URL_MAX_TTL, 3600),
  },

  upload: {
    maxFileSizeBytes: toNumber(
      process.env.STORAGE_MAX_FILE_SIZE_BYTES,
      25 * 1024 * 1024,
    ),
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    multipartThresholdBytes: toNumber(
      process.env.STORAGE_MULTIPART_THRESHOLD_BYTES,
      5 * 1024 * 1024,
    ),
    multipartChunkSizeBytes: toNumber(
      process.env.STORAGE_MULTIPART_CHUNK_SIZE_BYTES,
      5 * 1024 * 1024,
    ),
  },

  paths: {
    kycDocuments: 'kyc/documents',
    kycSelfies: 'kyc/selfies',
    userAvatars: 'users/avatars',
    providerAvatars: 'providers/avatars',
    tradeAttachments: 'trades/attachments',
    reports: 'reports',
    media: 'media',
    temporary: 'temp',
  },

  encryption: {
    enabled: true,
    algorithm: 'AES256',
    kmsKeyId: process.env.STORAGE_KMS_KEY_ID || null,
  },

  lifecycle: {
    temporaryRetentionDays: toNumber(process.env.STORAGE_TEMP_RETENTION_DAYS, 7),
    kycRetentionYears: toNumber(process.env.STORAGE_KYC_RETENTION_YEARS, 7),
    reportsRetentionDays: toNumber(process.env.STORAGE_REPORTS_RETENTION_DAYS, 365),
  },

  cdn: {
    enabled: toBoolean(process.env.STORAGE_CDN_ENABLED, false),
    baseUrl: process.env.STORAGE_CDN_URL || null,
  },
});

export default storageConfig;