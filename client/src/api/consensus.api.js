/**
 * Consensus API
 *
 * @module client/src/api/consensus.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const consensusApi = {
  getOverview: (params) => get(endpoints.consensus.overview, { params }),

  getBySymbol: (symbol, params) => get(endpoints.consensus.bySymbol(symbol), { params }),

  getHistory: (params) => get(endpoints.consensus.history, { params }),
};

export default consensusApi;