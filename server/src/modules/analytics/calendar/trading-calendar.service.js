/**
 * Trading Calendar Service
 *
 * @module signalforge/server/modules/analytics/calendar/trading-calendar
 */

import { CalendarRepository } from './calendar.repository.js';

export class TradingCalendarService {
  constructor(repository = null) {
    this.repository = repository || new CalendarRepository();
  }

  async build(userId, filters = {}) {
    const rows = await this.repository.aggregateByDay(userId, filters);

    const days = rows.map((row) => ({
      date: row.trading_day instanceof Date
        ? row.trading_day.toISOString().split('T')[0]
        : String(row.trading_day),
      tradeCount: row.trade_count,
      totalProfit: Number(row.total_profit || 0),
      winCount: row.win_count,
      lossCount: row.loss_count,
      winRate: this.calculateWinRate(row.win_count, row.loss_count),
    }));

    const summary = this.summarize(days);

    return { days, summary };
  }

  calculateWinRate(wins, losses) {
    const total = Number(wins || 0) + Number(losses || 0);
    return total > 0 ? Number(((wins / total) * 100).toFixed(2)) : 0;
  }

  summarize(days) {
    if (!Array.isArray(days) || days.length === 0) {
      return {
        totalDays: 0,
        tradingDays: 0,
        profitableDays: 0,
        losingDays: 0,
        totalProfit: 0,
        bestDay: null,
        worstDay: null,
      };
    }

    let profitableDays = 0;
    let losingDays = 0;
    let totalProfit = 0;
    let bestDay = days[0];
    let worstDay = days[0];

    for (const day of days) {
      totalProfit += day.totalProfit;
      if (day.totalProfit > 0) {
        profitableDays++;
      } else if (day.totalProfit < 0) {
        losingDays++;
      }
      if (day.totalProfit > bestDay.totalProfit) {
        bestDay = day;
      }
      if (day.totalProfit < worstDay.totalProfit) {
        worstDay = day;
      }
    }

    return {
      totalDays: days.length,
      tradingDays: days.filter((d) => d.tradeCount > 0).length,
      profitableDays,
      losingDays,
      totalProfit: Number(totalProfit.toFixed(2)),
      bestDay,
      worstDay,
    };
  }
}

export default TradingCalendarService;