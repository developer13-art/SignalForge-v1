/**
 * Performance API
 *
 * @module client/src/api/performance.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const performanceApi = {
  getSummary: (params) => get(endpoints.performance.summary, { params }),

  listPeriods: (params) => get(endpoints.performance.periods, { params }),

  getMetrics: (params) => get(endpoints.performance.metrics, { params }),

  listEquitySnapshots: (params) => get(endpoints.performance.equitySnapshots, { params }),
};

export default performanceApi;  