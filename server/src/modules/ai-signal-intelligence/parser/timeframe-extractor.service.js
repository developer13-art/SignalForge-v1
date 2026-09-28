/**
 * Timeframe Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/timeframe
 */
const { TimeframeNormalizerService } = require('../normalization/timeframe-normalizer.service.js');
class TimeframeExtractorService {
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
module.exports = TimeframeExtractorService;
module.exports.TimeframeExtractorService = TimeframeExtractorService;
