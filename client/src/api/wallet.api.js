/**
 * Wallet API
 *
 * @module client/src/api/wallet.api
 */

import { get, post, patch } from './client.js';
import { endpoints } from './endpoints.js';

export const walletApi = {
  getOverview: () => get(endpoints.wallet.overview),

  getBalance: () => get(endpoints.wallet.balance),

  listLedger: (params) => get(endpoints.wallet.ledger, { params }),

  listTransactions: (params) => get(endpoints.wallet.transactions, { params }),

  listPaymentAccounts: () => get(endpoints.wallet.paymentAccounts),

  addPaymentAccount: (payload) => post(endpoints.wallet.paymentAccounts, payload),

  updatePaymentAccount: (accountId, payload) =>
    patch(`${endpoints.wallet.paymentAccounts}/${accountId}`, payload),
};

export default walletApi;