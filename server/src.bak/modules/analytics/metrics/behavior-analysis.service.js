/**
 * Behavior Analysis Service
 *
 * @module signalforge/server/modules/analytics/metrics/behavior-analysis
 */

const HOURS_OF_DAY = 24;

export class BehaviorAnalysisService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length === 0) {
      return {
        byHour: [],
        byDayOfWeek: [],
        averageHoldTimeMinutes: 0,
        averageTradesPerDay: 0,
      };
    }

    const byHour = new Array(HOURS_OF_DAY).fill(0).map((_, hour) => ({
      hour,
      count: 0,
      profit: 0,
    }));

    const byDayOfWeek = Array.from({ length: 7 }, (_, day) => ({
      day,
      count: 0,
      profit: 0,
    }));

    const dayBuckets = new Map();
    let totalHoldTime = 0;
    let holdTimeSamples = 0;

    for (const trade of trades) {
      const closedAt = trade.closed_at ? new Date(trade.closed_at) : null;
      const openedAt = trade.opened_at ? new Date(trade.opened_at) : null;
      const profit = Number(trade.realized_profit || 0);

      if (closedAt) {
        const hour = closedAt.getUTCHours();
        byHour[hour].count++;
        byHour[hour].profit += profit;

        const day = closedAt.getUTCDay();
        byDayOfWeek[day].count++;
        byDayOfWeek[day].profit += profit;

        const dayKey = closedAt.toISOString().split('T')[0];
        dayBuckets.set(dayKey, (dayBuckets.get(dayKey) || 0) + 1);
      }

      if (closedAt && openedAt) {
        const holdMinutes = (closedAt.getTime() - openedAt.getTime()) / (60 * 1000);
        if (holdMinutes > 0) {
          totalHoldTime += holdMinutes;
          holdTimeSamples++;
        }
      }
    }

    const dayCount = dayBuckets.size;
    const averageTradesPerDay = dayCount > 0 ? trades.length / dayCount : 0;
    const averageHoldTimeMinutes = holdTimeSamples > 0 ? totalHoldTime / holdTimeSamples : 0;

    return {
      byHour: byHour.map((h) => ({
        hour: h.hour,
        count: h.count,
        profit: Number(h.profit.toFixed(2)),
      })),
      byDayOfWeek: byDayOfWeek.map((d) => ({
        day: d.day,
        count: d.count,
        profit: Number(d.profit.toFixed(2)),
      })),
      averageHoldTimeMinutes: Number(averageHoldTimeMinutes.toFixed(2)),
      averageTradesPerDay: Number(averageTradesPerDay.toFixed(2)),
    };
  }
}

export default BehaviorAnalysisService;