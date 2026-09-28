/**
 * Discipline Analysis Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/discipline
 */

export class DisciplineService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return { score: 0, alerts: [], samples: 0 };
    }

    const alerts = [];

    const tradesWithoutStopLoss = trades.filter(
      (t) => t.stop_loss === null || t.stop_loss === undefined,
    );
    const noStopLossRatio = tradesWithoutStopLoss.length / trades.length;
    if (noStopLossRatio > 0.2) {
      alerts.push({
        type: 'MISSING_STOP_LOSS',
        severity: 'HIGH',
        ratio: Number(noStopLossRatio.toFixed(4)),
      });
    }

    const tradesWithoutTakeProfit = trades.filter(
      (t) => t.take_profit === null || t.take_profit === undefined,
    );
    const noTakeProfitRatio = tradesWithoutTakeProfit.length / trades.length;
    if (noTakeProfitRatio > 0.5) {
      alerts.push({
        type: 'MISSING_TAKE_PROFIT',
        severity: 'MEDIUM',
        ratio: Number(noTakeProfitRatio.toFixed(4)),
      });
    }

    const losingTrades = trades.filter(
      (t) => Number(t.realized_profit || 0) < 0,
    );
    const winners = trades.filter((t) => Number(t.realized_profit || 0) > 0);

    const avgWin =
      winners.length > 0
        ? winners.reduce((a, b) => a + Number(b.realized_profit), 0) / winners.length
        : 0;
    const avgLoss =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((a, b) => a + Number(b.realized_profit), 0) /
              losingTrades.length,
          )
        : 0;

    if (avgLoss > 0 && avgWin > 0) {
      const ratio = avgWin / avgLoss;
      if (ratio < 1) {
        alerts.push({
          type: 'POOR_RISK_REWARD',
          severity: 'HIGH',
          ratio: Number(ratio.toFixed(4)),
        });
      }
    }

    const disciplinePenalty =
      alerts.reduce((sum, a) => {
        if (a.severity === 'HIGH') {
          return sum + 0.25;
        }
        if (a.severity === 'MEDIUM') {
          return sum + 0.15;
        }
        return sum + 0.05;
      }, 0);

    const score = Math.max(0, 1 - disciplinePenalty);

    return {
      score: Number(score.toFixed(4)),
      alerts,
      samples: trades.length,
    };
  }

  classify(score) {
    if (score >= 0.85) {
      return 'HIGHLY_DISCIPLINED';
    }
    if (score >= 0.7) {
      return 'DISCIPLINED';
    }
    if (score >= 0.5) {
      return 'MODERATE';
    }
    return 'UNDISCIPLINED';
  }
}

export default DisciplineService;