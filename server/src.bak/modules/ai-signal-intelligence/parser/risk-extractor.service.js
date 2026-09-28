/**
 * Risk Extractor Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/risk
 */

const RISK_PATTERNS = Object.freeze([
  /risk\s*[:\-]?\s*(\d{1,3}(?:\.\d{1,2})?)\s*%/i,
  /(\d{1,3}(?:\.\d{1,2})?)\s*%\s*risk/i,
  /risk\s+(?:of\s+)?(\d{1,3}(?:\.\d{1,2})?)/i,
]);

const LOT_PATTERNS = Object.freeze([
  /(?:lot|size|volume)\s*[:\-]?\s*(\d{1,4}(?:\.\d{1,4})?)/i,
  /(\d{1,4}(?:\.\d{1,4})?)\s*(?:lot|lots)/i,
]);

export class RiskExtractorService {
  extractRiskPercent(text) {
    if (typeof text !== 'string') {
      return null;
    }
    for (const pattern of RISK_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = Number(match[1]);
        if (Number.isFinite(value) && value >= 0 && value <= 100) {
          return value;
        }
      }
    }
    return null;
  }

  extractLotSize(text) {
    if (typeof text !== 'string') {
      return null;
    }
    for (const pattern of LOT_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = Number(match[1]);
        if (Number.isFinite(value) && value > 0) {
          return value;
        }
      }
    }
    return null;
  }

  extract(text) {
    return {
      riskPercent: this.extractRiskPercent(text),
      lotSize: this.extractLotSize(text),
    };
  }
}

export default RiskExtractorService;