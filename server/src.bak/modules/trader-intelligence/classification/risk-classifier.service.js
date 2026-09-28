/**
 * Risk Style Classifier Service
 *
 * @module signalforge/server/modules/trader-intelligence/classification/risk-classifier
 */

import { RISK_STYLES } from '../intelligence.constants.js';

export class RiskClassifierService {
  classify({ trades, maxDrawdownPercent, averageRr }) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return {
        riskStyle: RISK_STYLES.UNCLASSIFIED,
        score: 0,
      };
    }

    const drawdownScore = Math.min(1, Number(maxDrawdownPercent || 0) / 50);
    const averageRrScore = Math.min(1, Number(averageRr || 0) / 3);

    const winCount = trades.filter((t) => Number(t.realized_profit || 0) > 0).length;
    const winRate = winCount / trades.length;
    const riskAppetite = 1 - winRate;

    const score = Number(
      Math.min(1, drawdownScore * 0.4 + averageRrScore * 0.3 + riskAppetite * 0.3).toFixed(4),
    );

    let riskStyle;
    if (score >= 0.75) {
      riskStyle = RISK_STYLES.VERY_AGGRESSIVE;
    } else if (score >= 0.55) {
      riskStyle = RISK_STYLES.AGGRESSIVE;
    } else if (score >= 0.35) {
      riskStyle = RISK_STYLES.MODERATE;
    } else {
      riskStyle = RISK_STYLES.CONSERVATIVE;
    }

    return {
      riskStyle,
      score,
      drawdownScore: Number(drawdownScore.toFixed(4)),
      averageRrScore: Number(averageRrScore.toFixed(4)),
    };
  }
}

export default RiskClassifierService;