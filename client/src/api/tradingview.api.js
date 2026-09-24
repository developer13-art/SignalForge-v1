/**
 * TradingView API
 *
 * @module client/src/api/tradingview.api
 */

import { get, post, del } from './client.js';
import { endpoints } from './endpoints.js';

export const tradingviewApi = {
  listIntegrations: () => get(endpoints.tradingview.integrations),

  createIntegration: (payload) => post(endpoints.tradingview.create, payload),

  removeIntegration: (integrationId) => del(endpoints.tradingview.remove(integrationId)),
};

export default tradingviewApi;