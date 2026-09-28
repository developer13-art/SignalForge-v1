/**
 * Symbol Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/symbol
 */

import { SymbolNormalizerService } from '../normalization/symbol-normalizer.service.js';

export class SymbolExtractorService {
  constructor(normalizer = null) {
    this.normalizer = normalizer || new SymbolNormalizerService();
  }

  extract(text) {
    if (typeof text !== 'string') {
      return null;
    }
    const candidates = this.normalizer.extractFromText(text);
    return candidates.length > 0 ? candidates[0] : null;
  }

  extractAll(text) {
    if (typeof text !== 'string') {
      return [];
    }
    return this.normalizer.extractFromText(text);
  }
}

export default SymbolExtractorService;