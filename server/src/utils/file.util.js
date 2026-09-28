/**
 * File Utilities
 *
 * @module server/utils/file.util
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ALLOWED_EXTENSIONS = Object.freeze([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
  '.csv',
  '.xlsx',
  '.docx',
]);
function isAllowedExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return false;
  }
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return null;
  }
  return filename
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}
function buildStorageKey({ folder, filename, extension }) {
  const now = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const safeExt = (extension || path.extname(filename || '')).replace(/^\./, '') || 'bin';
  const safeFolder = (folder || 'misc').replace(/[^\w/.-]+/g, '');
  return `${safeFolder}/${now}-${random}.${safeExt}`;
}
async function ensureDirectory(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}
async function writeFile({ filePath, content }) {
  await fs.promises.writeFile(filePath, content);
  return filePath;
}
async function readFile({ filePath, encoding = 'utf8' }) {
  return fs.promises.readFile(filePath, encoding);
}
async function deleteFile({ filePath }) {
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}
function getFileSize({ filePath }) {
  try {
    const stat = fs.statSync(filePath);
    return stat.size;
  } catch (err) {
    return null;
  }
}
const fileUtil = {
  isAllowedExtension,
  sanitizeFilename,
  buildStorageKey,
  ensureDirectory,
  writeFile,
  readFile,
  deleteFile,
  getFileSize,
  ALLOWED_EXTENSIONS,
};
module.exports.fileUtil = fileUtil;
module.exports.isAllowedExtension = isAllowedExtension;
module.exports.sanitizeFilename = sanitizeFilename;
module.exports.buildStorageKey = buildStorageKey;
module.exports.getFileSize = getFileSize;

module.exports.ensureDirectory = ensureDirectory;

module.exports.writeFile = writeFile;

module.exports.readFile = readFile;

module.exports.deleteFile = deleteFile;
