/**
 * Normalizer Service
 *
 * Combines all field normalizers into a single entry point that
 * converts a raw parsed result into a canonical form.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/normalization/service
 */
const { SymbolNormalizerService } = require('./symbol-normalizer.service.js');
const { DirectionNormalizerService } = require('./direction-normalizer.service.js');
const { PriceNormalizerService } = require('./price-normalizer.service.js');
const { TimeframeNormalizerService } = require('./timeframe-normalizer.service.js');
const { TimestampNormalizerService } = require('./timestamp-normalizer.service.js');
const { NormalizationError } = require('../ai.errors.js');
const { emitNormalizationCompleted } = require('../ai.events.js');
class NormalizerService {
  constructor(dependencies = {}) {
    this.symbol = dependencies.symbol || new SymbolNormalizerService();
    this.direction = dependencies.direction || new DirectionNormalizerService();
    this.price = dependencies.price || new PriceNormalizerService();
    this.timeframe = dependencies.timeframe || new TimeframeNormalizerService();
    this.timestamp = dependencies.timestamp || new TimestampNormalizerService();
  }

  normalize(parsed, meta = {}) {
    if (!parsed || typeof parsed !== 'object') {
      throw new NormalizationError('Parsed result must be an object');
    }

    const normalized = {
      symbol: parsed.symbol ? this.symbol.normalize(parsed.symbol) : null,
      direction: parsed.direction ? this.direction.normalize(parsed.direction) : null,
      entryType: parsed.entryType || 'MARKET',
      entryPrice: parsed.entryPrice !== undefined ? this.price.normalize(parsed.entryPrice) : null,
      stopLoss: parsed.stopLoss !== undefined ? this.price.normalize(parsed.stopLoss) : null,
      takeProfits: Array.isArray(parsed.takeProfits)
        ? parsed.takeProfits.map((tp) => this.price.normalize(tp)).filter((tp) => tp !== null)
        : [],
      riskPercent:
        typeof parsed.riskPercent === 'number' ? parsed.riskPercent : null,
      lotSize: typeof parsed.lotSize === 'number' ? parsed.lotSize : null,
      timeframe: parsed.timeframe ? this.timeframe.normalize(parsed.timeframe) : null,
      timestamp: this.timestamp.normalize(parsed.timestamp),
      intent: parsed.intent || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
      reasoning: parsed.reasoning || null,
    };

    setImmediate(() => {
      emitNormalizationCompleted(meta.messageId || null, meta).catch(() => {});
    });

    return normalized;
  }
}
module.exports = NormalizerService;
module.exports.NormalizerService = NormalizerService;
