/**
 * Replay API
 *
 * @module client/src/api/replay.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const replayApi = {
  replaySignal: (signalId, params) => get(endpoints.replay.signals(signalId), { params }),

  replayTrade: (tradeId) => get(endpoints.replay.trades(tradeId)),

  replayAi: (signalId) => get(endpoints.replay.ai(signalId)),

  replayRisk: (signalId) => get(endpoints.replay.risk(signalId)),

  replayExecution: (tradeId) => get(endpoints.replay.execution(tradeId)),

  replayProviderMessage: (providerId, externalMessageId) =>
    get(endpoints.replay.providerMessage(providerId, externalMessageId)),

  replaySystem: (correlationId) => get(endpoints.replay.system(correlationId)),
};

export default replayApi;