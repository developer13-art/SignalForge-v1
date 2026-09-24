/**
 * Analytics API
 *
 * @module client/src/api/analytics.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const analyticsApi = {
  getOverview: (params) => get(endpoints.analytics.overview, { params }),

  getPerformance: (params) => get(endpoints.analytics.performance, { params }),

  getEquityCurve: (params) => get(endpoints.analytics.equityCurve, { params }),

  getProfit: (params) => get(endpoints.analytics.profit, { params }),

  getDrawdown: (params) => get(endpoints.analytics.drawdown, { params }),

  getWinRate: (params) => get(endpoints.analytics.winRate, { params }),

  getRiskReward: (params) => get(endpoints.analytics.riskReward, { params }),

  getSharpeRatio: (params) => get(endpoints.analytics.sharpe, { params }),

  getSortinoRatio: (params) => get(endpoints.analytics.sortino, { params }),

  getBestSymbols: (params) => get(endpoints.analytics.bestSymbols, { params }),

  getWorstSymbols: (params) => get(endpoints.analytics.worstSymbols, { params }),

  getLatency: (params) => get(endpoints.analytics.latency, { params }),

  getRiskBehavior: (params) => get(endpoints.analytics.riskBehavior, { params }),

  getCalendar: (params) => get(endpoints.analytics.calendar, { params }),

  listReports: (params) => get(endpoints.analytics.reports, { params }),

  exportReport: (params) => get(endpoints.analytics.export, { params, responseType: 'blob' }),
};

export default analyticsApi;