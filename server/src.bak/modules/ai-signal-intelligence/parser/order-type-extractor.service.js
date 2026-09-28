/**
 * Order Type Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/order-type
 */

const PATTERNS = Object.freeze([
  { pattern: /\b(market\s+(buy|sell|order)|at\s+market|now)\b/i, type: 'MARKET' },
  { pattern: /\b(buy\s+limit|sell\s+limit|limit\s+order|limit\s+at)\b/i, type: 'LIMIT' },
  { pattern: /\b(buy\s+stop|sell\s+stop|stop\s+order|stop\s+at)\b/i, type: 'STOP' },
  { pattern: /\b(stop\s+limit|stop[\-\s]*limit\s+order)\b/i, type: 'STOP_LIMIT' },
]);

export class OrderTypeExtractorService {
  extract(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return 'MARKET';
    }
    for (const rule of PATTERNS) {
      if (rule.pattern.test(text)) {
        return rule.type;
      }
    }
    return 'MARKET';
  }
}

export default OrderTypeExtractorService;