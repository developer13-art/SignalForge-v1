/**
 * Eligible Net Profit Service
 *
 * Eligible net profit is the basis for referral reward calculation:
 * gross profit minus gross loss minus eligible trading costs. If the
 * net is negative, it is floored at zero.
 *
 * @module signalforge/server/modules/performance/metrics/eligible-net-profit
 */

export class EligibleNetProfitService {
  calculate({ grossProfit, grossLoss, tradingCosts }) {
    const profit = Number(grossProfit || 0);
    const loss = Number(grossLoss || 0);
    const costs = Number(tradingCosts || 0);

    const net = profit - loss - costs;
    const eligible = Math.max(0, net);

    return {
      grossProfit: Number(profit.toFixed(2)),
      grossLoss: Number(loss.toFixed(2)),
      tradingCosts: Number(costs.toFixed(2)),
      net: Number(eligible.toFixed(2)),
      rawNet: Number(net.toFixed(2)),
      floored: net < 0,
    };
  }
}

export default EligibleNetProfitService;