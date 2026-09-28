/**
 * Agreement Calculator Service
 *
 * @module signalforge/server/modules/consensus/agreement-calculator
 */

import {
  CONSENSUS_DIRECTIONS,
  DEFAULT_HIGH_CONFIDENCE_THRESHOLD,
} from './consensus.constants.js';

export class AgreementCalculatorService {
  compute(members) {
    if (!Array.isArray(members) || members.length === 0) {
      return {
        agreement: 0,
        dominantDirection: CONSENSUS_DIRECTIONS.NO_CONSENSUS,
        dominantRatio: 0,
        consensusStrength: 'NONE',
      };
    }

    const total = members.length;
    let buyCount = 0;
    let sellCount = 0;
    for (const member of members) {
      if (member.direction === CONSENSUS_DIRECTIONS.BUY) {
        buyCount++;
      } else if (member.direction === CONSENSUS_DIRECTIONS.SELL) {
        sellCount++;
      }
    }

    const dominantDirection =
      buyCount > sellCount
        ? CONSENSUS_DIRECTIONS.BUY
        : sellCount > buyCount
          ? CONSENSUS_DIRECTIONS.SELL
          : CONSENSUS_DIRECTIONS.NO_CONSENSUS;

    const dominantRatio =
      dominantDirection === CONSENSUS_DIRECTIONS.BUY
        ? buyCount / total
        : dominantDirection === CONSENSUS_DIRECTIONS.SELL
          ? sellCount / total
          : 0;

    const confidenceValues = members
      .map((m) => Number(m.confidence))
      .filter((v) => Number.isFinite(v));
    const avgConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
        : 0;

    const agreement = Number((dominantRatio * (0.5 + avgConfidence * 0.5)).toFixed(4));

    return {
      agreement,
      dominantDirection,
      dominantRatio: Number(dominantRatio.toFixed(4)),
      averageConfidence: Number(avgConfidence.toFixed(4)),
      buyCount,
      sellCount,
      total,
      consensusStrength: this.classify(agreement),
    };
  }

  classify(agreement) {
    if (agreement >= DEFAULT_HIGH_CONFIDENCE_THRESHOLD) {
      return 'HIGH';
    }
    if (agreement >= 0.6) {
      return 'MEDIUM';
    }
    if (agreement >= 0.4) {
      return 'LOW';
    }
    return 'NONE';
  }
}

export default AgreementCalculatorService;