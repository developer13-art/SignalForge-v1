/**
 * Minimal storage abstraction used by signal-source attachments.
 *
 * The platform already declares S3-compatible configuration, but the
 * runtime environment in this workspace does not include a real object
 * storage provider. This shim stores files under the configured local
 * storage root so uploads do not crash the application in development.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const storageConfig = require('../config/storage.config.js');

function getRootDir() {
  return path.resolve(process.cwd(), storageConfig.local.root || './storage/private');
}

async function ensureRoot() {
  const root = getRootDir();
  await fs.mkdir(root, { recursive: true });
  return root;
}

async function uploadPrivate({ key, body, contentType, metadata }) {
  if (!key) {
    throw new Error('Storage key is required');
  }

  const root = await ensureRoot();
  const target = path.join(root, key);
  const dir = path.dirname(target);
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body || '');
  await fs.writeFile(target, buffer);

  return {
    key,
    contentType: contentType || 'application/octet-stream',
    metadata: metadata || null,
    size: buffer.length,
    url: path.posix.join((storageConfig.local.baseUrl || '/storage').replace(/\/$/, ''), key),
  };
}

async function uploadPublic({ key, body, contentType, metadata }) {
  return uploadPrivate({ key, body, contentType, metadata });
}

async function deleteObject({ key }) {
  if (!key) {
    return false;
  }

  try {
    const root = getRootDir();
    await fs.rm(path.join(root, key), { force: true });
    return true;
  } catch {
    return false;
  }
}

async function exists({ key }) {
  if (!key) {
    return false;
  }

  try {
    await fs.access(path.join(getRootDir(), key));
    return true;
  } catch {
    return false;
  }
}

async function streamDownload({ key }) {
  const filePath = path.join(getRootDir(), key);
  return fs.readFile(filePath);
}

async function getSignedUrl({ key, expiresIn }) {
  const base = (storageConfig.local.baseUrl || '/storage').replace(/\/$/, '');
  const token = crypto.createHash('sha256').update(`${key}:${expiresIn || 900}`).digest('hex');
  return `${base}/${encodeURIComponent(key)}?sig=${token}`;
}

const storageService = {
  uploadPrivate,
  uploadPublic,
  deleteObject,
  exists,
  streamDownload,
  getSignedUrl,
};

module.exports.storageService = storageService;
module.exports.uploadPrivate = uploadPrivate;
module.exports.uploadPublic = uploadPublic;
module.exports.deleteObject = deleteObject;
module.exports.exists = exists;
module.exports.streamDownload = streamDownload;
module.exports.getSignedUrl = getSignedUrl;
