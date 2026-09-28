/**
 * Price Normalizer Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/normalization/price
 */

import { parsePrice } from '@signalforge/shared/validators/price.validator';

export class PriceNormalizerService {
  normalize(input) {
    if (input === null || input === undefined) {
      return null;
    }
    if (typeof input === 'number') {
      return Number.isFinite(input) ? input : null;
    }
    if (typeof input === 'string') {
      const cleaned = input.replace(/[^0-9.\-]/g, '');
      return parsePrice(cleaned);
    }
    return null;
  }

  extractAllFromText(text) {
    if (typeof text !== 'string') {
      return [];
    }
    const regex = /(?<![A-Za-z0-9])(-?\d{1,7}(?:\.\d{1,6})?)(?![A-Za-z0-9])/g;
    const results = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const parsed = this.normalize(match[1]);
      if (parsed !== null) {
        results.push(parsed);
      }
    }
    return results;
  }
}

export default PriceNormalizerService;