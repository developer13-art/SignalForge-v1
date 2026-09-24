/**
 * Brokers API
 *
 * @module client/src/api/broker.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const brokerApi = {
  listAccounts: () => get(endpoints.brokers.accounts),

  connectAccount: (payload) => post(endpoints.brokers.connect, payload),

  getAccount: (accountId) => get(endpoints.brokers.account(accountId)),

  updateAccount: (accountId, payload) => patch(endpoints.brokers.update(accountId), payload),

  disconnectAccount: (accountId) => post(endpoints.brokers.disconnect(accountId)),

  syncAccount: (accountId) => post(endpoints.brokers.sync(accountId)),

  getBalance: (accountId) => get(endpoints.brokers.balance(accountId)),

  listSnapshots: (accountId, params) => get(endpoints.brokers.snapshots(accountId), { params }),

  listLogs: (accountId, params) => get(endpoints.brokers.logs(accountId), { params }),

  listPlatforms: () => get(endpoints.brokers.platforms),
};

export default brokerApi;