/**
 * Password Utilities
 *
 * @module server/utils/password.util
 */
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const { config } = require('../config');

const DEFAULT_ROUNDS = (config.security && config.security.hashSaltRounds) || 12;

export async function hashPassword(plain) {
  if (typeof plain !== 'string' || plain.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(plain, DEFAULT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  if (typeof plain !== 'string' || typeof hash !== 'string') {
    return false;
  }
  return bcrypt.compare(plain, hash);
}
function needsRehash(hash, rounds = DEFAULT_ROUNDS) {
  if (!hash || typeof hash !== 'string') {
    return true;
  }
  const parsed = bcrypt.getRounds ? bcrypt.getRounds(hash) : null;
  if (parsed === null) {
    return true;
  }
  return parsed < rounds;
}
function generatePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = crypto.randomBytes(length * 2);
  let result = '';
  let i = 0;

  while (result.length < length && i < bytes.length) {
    const byte = bytes[i++];
    const idx = byte % charset.length;
    result += charset[idx];
  }

  return result;
}
const passwordUtil = {
  hashPassword,
  verifyPassword,
  needsRehash,
  generatePassword,
  DEFAULT_ROUNDS,
};
module.exports.passwordUtil = passwordUtil;
module.exports.needsRehash = needsRehash;
module.exports.generatePassword = generatePassword;
