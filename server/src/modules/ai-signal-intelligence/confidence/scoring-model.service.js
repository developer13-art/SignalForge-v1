/**
 * Scoring Model Service
 *
 * Computes a final confidence score from multiple factors including
 * parser output, extraction completeness, and provider reliability.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/confidence/scoring-model
 */

const WEIGHTS = Object.freeze({
  parserConfidence: 0.4,
  symbolPresent: 0.15,
  directionPresent: 0.15,
  entryPresent: 0.1,
  stopLossPresent: 0.1,
  takeProfitPresent: 0.1,
});

export class ScoringModelService {
  score(fields, parserConfidence = 0.5) {
    const factors = {};
    let totalWeight = 0;
    let weightedSum = 0;

    factors.parserConfidence = Math.max(0, Math.min(1, parserConfidence));
    weightedSum += factors.parserConfidence * WEIGHTS.parserConfidence;
    totalWeight += WEIGHTS.parserConfidence;

    factors.symbolPresent = fields.symbol ? 1 : 0;
    weightedSum += factors.symbolPresent * WEIGHTS.symbolPresent;
    totalWeight += WEIGHTS.symbolPresent;

    factors.directionPresent = fields.direction ? 1 : 0;
    weightedSum += factors.directionPresent * WEIGHTS.directionPresent;
    totalWeight += WEIGHTS.directionPresent;

    factors.entryPresent =
      fields.entryPrice !== null && fields.entryPrice !== undefined ? 1 : 0;
    weightedSum += factors.entryPresent * WEIGHTS.entryPresent;
    totalWeight += WEIGHTS.entryPresent;

    factors.stopLossPresent =
      fields.stopLoss !== null && fields.stopLoss !== undefined ? 1 : 0;
    weightedSum += factors.stopLossPresent * WEIGHTS.stopLossPresent;
    totalWeight += WEIGHTS.stopLossPresent;

    factors.takeProfitPresent =
      Array.isArray(fields.takeProfits) && fields.takeProfits.length > 0 ? 1 : 0;
    weightedSum += factors.takeProfitPresent * WEIGHTS.takeProfitPresent;
    totalWeight += WEIGHTS.takeProfitPresent;

    const confidence = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
      confidence: Number(confidence.toFixed(4)),
      factors,
    };
  }
}

export default ScoringModelService;