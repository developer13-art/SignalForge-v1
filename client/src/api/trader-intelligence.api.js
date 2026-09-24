/**
 * Trader Intelligence API
 *
 * @module client/src/api/trader-intelligence.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const traderIntelligenceApi = {
  getOverview: (traderId, params) =>
    get(endpoints.traderIntelligence.overview, { params: { traderId, ...params } }),

  getConsistency: (traderId, params) =>
    get(endpoints.traderIntelligence.consistency(traderId), { params }),

  getAverageRiskReward: (traderId, params) =>
    get(endpoints.traderIntelligence.averageRiskReward(traderId), { params }),

  getHoldingTime: (traderId, params) =>
    get(endpoints.traderIntelligence.holdingTime(traderId), { params }),

  getRiskBehavior: (traderId, params) =>
    get(endpoints.traderIntelligence.riskBehavior(traderId), { params }),

  getMartingaleGridDetection: (traderId, params) =>
    get(endpoints.traderIntelligence.martingaleGrid(traderId), { params }),

  getNewsExposure: (traderId, params) =>
    get(endpoints.traderIntelligence.newsExposure(traderId), { params }),

  getRecoveryTrading: (traderId, params) =>
    get(endpoints.traderIntelligence.recoveryTrading(traderId), { params }),

  getStyleClassification: (traderId) =>
    get(endpoints.traderIntelligence.styleClassification(traderId)),

  getBehaviorTimeline: (traderId, params) =>
    get(endpoints.traderIntelligence.behaviorTimeline(traderId), { params }),
};

export default traderIntelligenceApi;