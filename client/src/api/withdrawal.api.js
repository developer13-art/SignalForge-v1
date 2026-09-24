/**
 * Withdrawals API
 *
 * @module client/src/api/withdrawal.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const withdrawalApi = {
  listWithdrawals: (params) => get(endpoints.withdrawals.list, { params }),

  createWithdrawal: (payload) => post(endpoints.withdrawals.create, payload),

  getWithdrawal: (withdrawalId) => get(endpoints.withdrawals.withdrawal(withdrawalId)),

  cancelWithdrawal: (withdrawalId) => post(endpoints.withdrawals.cancel(withdrawalId)),

  getStatus: (withdrawalId) => get(endpoints.withdrawals.status(withdrawalId)),
};

export default withdrawalApi;