/**
 * Symbol Normalizer Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/normalization/symbol
 */

import { normalizeSymbol as sharedNormalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

const ADDITIONAL_ALIASES = Object.freeze({
  'GOLD SPOT': 'XAUUSD',
  'GOLD-USD': 'XAUUSD',
  'SILVER SPOT': 'XAGUSD',
  'SILVER-USD': 'XAGUSD',
  'CRUDE OIL': 'USOIL',
  'WTI OIL': 'USOIL',
  'BRENT OIL': 'UKOIL',
  'US TECH': 'NAS100',
  'US TECH 100': 'NAS100',
  'US 30': 'US30',
  'US 500': 'SPX500',
  'DAX 40': 'GER40',
  'FTSE 100': 'UK100',
  'NIKKEI 225': 'JP225',
});

export class SymbolNormalizerService {
  normalize(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }
    const upper = input.trim().toUpperCase();
    if (ADDITIONAL_ALIASES[upper]) {
      return ADDITIONAL_ALIASES[upper];
    }
    return sharedNormalizeSymbol(upper);
  }

  extractFromText(text) {
    if (typeof text !== 'string') {
      return [];
    }
    const matches = [];
    const regex = /\b([A-Z]{2,6}[\/\-]?[A-Z]{0,5})\b/g;
    const seen = new Set();
    let match;
    while ((match = regex.exec(text.toUpperCase())) !== null) {
      const candidate = match[1];
      const normalized = this.normalize(candidate);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        matches.push(normalized);
      }
    }
    return matches;
  }
}

export default SymbolNormalizerService;