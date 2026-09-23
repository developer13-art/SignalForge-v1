/**
 * Entry Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/entry
 */

import { PriceNormalizerService } from '../normalization/price-normalizer.service.js';

const PATTERNS = Object.freeze([
  /(?:entry|enter|buy|sell|long|short|@|at)\s*[:\-]?\s*(-?\d{1,7}(?:\.\d{1,6})?)/i,
  /@\s*(-?\d{1,7}(?:\.\d{1,6})?)/i,
]);

export class EntryExtractorService {
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

export default EntryExtractorService;