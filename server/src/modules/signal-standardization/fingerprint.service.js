/**
 * Fingerprint Service
 *
 * Computes a stable fingerprint for a standardized signal so that
 * semantically equivalent signals can be identified even when their
 * phrasing differs.
 *
 * @module signalforge/server/modules/signal-standardization/fingerprint
 */

import crypto from 'node:crypto';

import { canonicalize } from '@signalforge/shared/utils/hash.util';
import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';
import { normalizeDirection } from '@signalforge/shared/constants/order-directions';

import {
  FINGERPRINT_ALGORITHM,
  FINGERPRINT_LENGTH,
  FINGERPRINT_PREFIX_LENGTH,
  DUPLICATE_WINDOW_SECONDS,
} from './standardization.constants.js';
import { FingerprintComputationError } from './standardization.errors.js';

export class FingerprintService {
  compute(signal) {
    if (!signal || typeof signal !== 'object') {
      throw new FingerprintComputationError('Signal must be an object');
    }

    const components = {
      providerId: signal.providerId || null,
      symbol: signal.symbol ? normalizeSymbol(signal.symbol) : null,
      direction: signal.direction ? normalizeDirection(signal.direction) : null,
      entryType: signal.entryType || 'MARKET',
      entryPrice: normalizePrice(signal.entryPrice),
      stopLoss: normalizePrice(signal.stopLoss),
      takeProfits: Array.isArray(signal.takeProfits)
        ? signal.takeProfits.map(normalizePrice).filter((v) => v !== null).sort((a, b) => a - b)
        : [],
      timeframe: signal.timeframe || null,
    };

    const canonical = canonicalize(components);
    const fingerprint = crypto
      .createHash(FINGERPRINT_ALGORITHM)
      .update(canonical)
      .digest('hex');

    if (fingerprint.length !== FINGERPRINT_LENGTH) {
      throw new FingerprintComputationError('Fingerprint length is invalid', {
        fingerprint,
      });
    }

    return {
      fingerprint,
      components,
    };
  }

  computePrefix(fingerprint, length = FINGERPRINT_PREFIX_LENGTH) {
    if (typeof fingerprint !== 'string' || fingerprint.length < length) {
      throw new FingerprintComputationError('Fingerprint is too short');
    }
    return fingerprint.substring(0, length);
  }

  buildDuplicateKey(fingerprint, windowSeconds = DUPLICATE_WINDOW_SECONDS) {
    if (typeof fingerprint !== 'string') {
      throw new FingerprintComputationError('Fingerprint must be a string');
    }
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    return `${fingerprint}:${window}`;
  }

  equals(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}

function normalizePrice(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number(value.toFixed(8));
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? Number(parsed.toFixed(8)) : null;
  }
  return null;
}

export default FingerprintService;