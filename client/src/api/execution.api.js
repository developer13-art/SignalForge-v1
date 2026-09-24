/**
 * Execution API
 *
 * @module client/src/api/execution.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const executionApi = {
  listRequests: (params) => get(endpoints.execution.requests, { params }),

  listHistory: (params) => get(endpoints.execution.history, { params }),

  retry: (executionId) => post(endpoints.execution.retry(executionId)),

  listLogs: (params) => get(endpoints.execution.logs, { params }),
};

export default executionApi;    