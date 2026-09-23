/**
 * Timeframe Normalizer Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/normalization/timeframe
 */

import { normalizeTimeframe } from '@signalforge/shared/validators/timeframe.validator';

export class TimeframeNormalizerService {
  normalize(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }
    return normalizeTimeframe(input);
  }

  extractFromText(text) {
    if (typeof text !== 'string') {
      return null;
    }
    const candidates = [
      'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN1',
      '1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W',
      '1MIN', '5MIN', '15MIN', '30MIN', '1HOUR', '4HOUR',
      'DAILY', 'WEEKLY', 'MONTHLY',
    ];
    const upper = text.toUpperCase();
    for (const candidate of candidates) {
      const regex = new RegExp(`\\b${candidate}\\b`);
      if (regex.test(upper)) {
        const normalized = this.normalize(candidate);
        if (normalized) {
          return normalized;
        }
      }
    }
    return null;
  }
}

export default TimeframeNormalizerService;