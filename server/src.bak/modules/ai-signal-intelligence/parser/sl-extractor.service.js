/**
 * Stop Loss Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/sl
 */

import { PriceNormalizerService } from '../normalization/price-normalizer.service.js';

const PATTERNS = Object.freeze([
  /(?:sl|stop\s*loss|stop|stoploss)\s*[:\-]?\s*(-?\d{1,7}(?:\.\d{1,6})?)/i,
  /(?:sl|stop)\s+(?:at|@)\s*(-?\d{1,7}(?:\.\d{1,6})?)/i,
  /(?<=\bsl\s*)\d{1,7}(?:\.\d{1,6})?/i,
]);

export class SlExtractorService {
  constructor(normalizer = null) {
    this.normalizer = normalizer || new PriceNormalizerService();
  }

  extract(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return null;
    }
    for (const pattern of PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const price = this.normalizer.normalize(match[1]);
        if (price !== null) {
          return price;
        }
      }
    }
    return null;
  }
}

export default SlExtractorService;