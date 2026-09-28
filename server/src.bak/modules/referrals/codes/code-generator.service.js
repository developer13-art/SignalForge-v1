/**
 * Referral Code Generator Service
 *
 * @module signalforge/server/modules/referrals/codes/generator
 */

import crypto from 'node:crypto';

import { DEFAULT_REFERRAL_CODE_LENGTH } from '../referral.constants.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class CodeGeneratorService {
  constructor(length = DEFAULT_REFERRAL_CODE_LENGTH) {
    this.length = length;
  }

  generate(prefix = 'SF') {
    const random = this.randomString(this.length);
    return `${prefix}${random}`;
  }

  randomString(length) {
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return result;
  }

  normalize(code) {
    if (typeof code !== 'string') {
      return null;
    }
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  }

  isValidFormat(code) {
    if (typeof code !== 'string') {
      return false;
    }
    return /^[A-Z0-9_-]{4,32}$/.test(code);
  }
}

export default CodeGeneratorService;