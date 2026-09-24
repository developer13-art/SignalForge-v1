/**
 * Trades API
 *
 * @module client/src/api/trade.api
 */

import { get, post, patch } from './client.js';
import { endpoints } from './endpoints.js';

export const tradeApi = {
  list: (params) => get(endpoints.trades.list, { params }),

  listOpenPositions: (params) => get(endpoints.trades.openPositions, { params }),

  getPosition: (positionId) => get(endpoints.trades.position(positionId)),

  listHistory: (params) => get(endpoints.trades.history, { params }),

  getTrade: (tradeId) => get(endpoints.trades.trade(tradeId)),

  getTimeline: (tradeId) => get(endpoints.trades.timeline(tradeId)),

  listEvents: (tradeId) => get(endpoints.trades.events(tradeId)),

  listPendingOrders: (params) => get(endpoints.trades.pending, { params }),

  closeTrade: (tradeId, payload) => post(endpoints.trades.close(tradeId), payload),

  modifyTrade: (tradeId, payload) => patch(endpoints.trades.modify(tradeId), payload),

  getShadow: (tradeId) => get(endpoints.trades.shadow(tradeId)),

  replay: (tradeId) => get(endpoints.trades.replay(tradeId)),
};

export default tradeApi;