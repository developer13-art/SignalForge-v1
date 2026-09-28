/**
 * File Utilities
 *
 * @module server/utils/file.util
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

export function isAllowedExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return false;
  }
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return null;
  }
  return filename
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function buildStorageKey({ folder, filename, extension }) {
  const now = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const safeExt = (extension || path.extname(filename || '')).replace(/^\./, '') || 'bin';
  const safeFolder = (folder || 'misc').replace(/[^\w/.-]+/g, '');
  return `${safeFolder}/${now}-${random}.${safeExt}`;
}

export async function ensureDirectory(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeFile({ filePath, content }) {
  await fs.promises.writeFile(filePath, content);
  return filePath;
}

export async function readFile({ filePath, encoding = 'utf8' }) {
  return fs.promises.readFile(filePath, encoding);
}

export async function deleteFile({ filePath }) {
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

export function getFileSize({ filePath }) {
  try {
    const stat = fs.statSync(filePath);
    return stat.size;
  } catch (err) {
    return null;
  }
}

export const fileUtil = {
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