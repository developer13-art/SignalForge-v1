/**
 * Heatmap Service
 *
 * @module signalforge/server/modules/analytics/calendar/heatmap
 */

import { CalendarRepository } from './calendar.repository.js';
import { DEFAULT_HEATMAP_DAYS } from '../analytics.constants.js';

export class HeatmapService {
  constructor(repository = null) {
    this.repository = repository || new CalendarRepository();
  }

  async buildByDay(userId, filters = {}) {
    const rows = await this.repository.aggregateByDay(userId, filters);
    return rows.map((row) => ({
      date: row.trading_day instanceof Date
        ? row.trading_day.toISOString().split('T')[0]
        : String(row.trading_day),
      value: Number(row.total_profit || 0),
      count: row.trade_count,
    }));
  }

  async buildBySymbol(userId, filters = {}) {
    const rows = await this.repository.aggregateBySymbol(userId, filters);
    return rows.map((row) => ({
      symbol: row.symbol,
      value: Number(row.total_profit || 0),
      count: row.trade_count,
      winRate: this.calculateWinRate(row.win_count, row.loss_count),
    }));
  }

  calculateWinRate(wins, losses) {
    const total = Number(wins || 0) + Number(losses || 0);
    return total > 0 ? Number(((wins / total) * 100).toFixed(2)) : 0;
  }

  async buildMatrix(userId, filters = {}) {
    const days = filters.days || DEFAULT_HEATMAP_DAYS;
    const since =
      filters.since ||
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const rows = await this.repository.aggregateByDay(userId, {
      ...filters,
      since,
    });

    const byDayOfWeek = Array.from({ length: 7 }, () => ({}));

    for (const row of rows) {
      const date = row.trading_day instanceof Date
        ? row.trading_day
        : new Date(row.trading_day);
      const dow = date.getUTCDay();
      const hour = 12;
      if (!byDayOfWeek[dow][hour]) {
        byDayOfWeek[dow][hour] = { count: 0, profit: 0 };
      }
      byDayOfWeek[dow][hour].count += row.trade_count;
      byDayOfWeek[dow][hour].profit += Number(row.total_profit || 0);
    }

    return byDayOfWeek.map((row, dow) =>
      Object.entries(row).map(([hour, value]) => ({
        day: dow,
        hour: Number(hour),
        count: value.count,
        profit: Number(value.profit.toFixed(2)),
      })),
    );
  }
}

export default HeatmapService;