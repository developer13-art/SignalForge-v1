/**
 * Risk API
 *
 * @module client/src/api/risk.api
 */

import { get, put, post } from './client.js';
import { endpoints } from './endpoints.js';

export const riskApi = {
  getProfile: () => get(endpoints.risk.profile),

  updateProfile: (payload) => put(endpoints.risk.profile, payload),

  listChecks: (params) => get(endpoints.risk.checks, { params }),

  listDecisions: (params) => get(endpoints.risk.decisions, { params }),

  listEvents: (params) => get(endpoints.risk.events, { params }),

  triggerEmergencyStop: (payload) => post(endpoints.risk.emergencyStop, payload),
};

export default riskApi;