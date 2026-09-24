/**
 * Signals API
 *
 * @module client/src/api/signal.api
 */

import { get, post, del } from './client.js';
import { endpoints } from './endpoints.js';

export const signalApi = {
  list: (params) => get(endpoints.signals.list, { params }),

  listLive: (params) => get(endpoints.signals.live, { params }),

  listHistory: (params) => get(endpoints.signals.history, { params }),

  get: (signalId) => get(endpoints.signals.details(signalId)),

  getTimeline: (signalId) => get(endpoints.signals.timeline(signalId)),

  getConfidence: (signalId) => get(endpoints.signals.confidence(signalId)),

  getRisk: (signalId) => get(endpoints.signals.risk(signalId)),

  listByProvider: (providerId, params) =>
    get(endpoints.signals.provider(providerId), { params }),

  listDuplicates: (params) => get(endpoints.signals.duplicates, { params }),

  listConsensus: (params) => get(endpoints.signals.consensus, { params }),

  listRejected: (params) => get(endpoints.signals.rejected, { params }),

  replay: (signalId) => get(endpoints.signals.replay(signalId)),
};

export default signalApi;