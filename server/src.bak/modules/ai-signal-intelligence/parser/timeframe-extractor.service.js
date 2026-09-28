/**
 * Timeframe Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/timeframe
 */

import { TimeframeNormalizerService } from '../normalization/timeframe-normalizer.service.js';

export class TimeframeExtractorService {
  constructor(normalizer = null) {
    this.normalizer = normalizer || new TimeframeNormalizerService();
  }

  extract(text) {
    if (typeof text !== 'string') {
      return null;
    }
    return this.normalizer.extractFromText(text);
  }
}

export default TimeframeExtractorService;