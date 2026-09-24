/**
 * Executive API
 *
 * @module client/src/api/executive.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const executiveApi = {
  getDashboard: (params) => get(endpoints.executive.dashboard, { params }),

  getRevenue: (params) => get(endpoints.executive.revenue, { params }),

  getGrowth: (params) => get(endpoints.executive.growth, { params }),

  getRetention: (params) => get(endpoints.executive.retention, { params }),

  getConversion: (params) => get(endpoints.executive.conversion, { params }),

  getFinancialReport: (params) => get(endpoints.executive.financialReport, { params }),
};

export default executiveApi;