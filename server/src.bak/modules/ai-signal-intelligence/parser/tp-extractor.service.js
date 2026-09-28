/**
 * Take Profit Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/tp
 */

import { PriceNormalizerService } from '../normalization/price-normalizer.service.js';

const TP_PATTERNS = Object.freeze([
  /(?:tp\d?|take\s*profit\d?|target\d?)\s*[:\-]?\s*(-?\d{1,7}(?:\.\d{1,6})?)/gi,
  /(?:tp\d?|take\s*profit\d?|target\d?)\s+(?:at|@)\s*(-?\d{1,7}(?:\.\d{1,6})?)/gi,
  /(?<=\btp\d?\s*)\d{1,7}(?:\.\d{1,6})?/gi,
]);

export class TpExtractorService {
  constructor(normalizer = null) {
    this.normalizer = normalizer || new PriceNormalizerService();
  }

  extract(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return [];
    }
    const results = [];
    const seen = new Set();
    for (const pattern of TP_PATTERNS) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const price = this.normalizer.normalize(match[1]);
        if (price !== null && !seen.has(price)) {
          seen.add(price);
          results.push(price);
        }
      }
    }
    return results;
  }
}

export default TpExtractorService;