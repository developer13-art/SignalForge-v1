/**
 * Provider Certification API
 *
 * @module client/src/api/certification.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const certificationApi = {
  getStatus: (providerId) => get(endpoints.certification.status(providerId)),

  importHistoricalMessages: (providerId, payload) =>
    post(endpoints.certification.importHistory(providerId), payload),

  getTrainingDataset: (providerId) => get(endpoints.certification.dataset(providerId)),

  getParsingAccuracy: (providerId) => get(endpoints.certification.parsingAccuracy(providerId)),

  runBacktest: (providerId, payload) => post(endpoints.certification.backtest(providerId), payload),

  getExpectedPerformance: (providerId) => get(endpoints.certification.performance(providerId)),

  getRiskAssessment: (providerId) => get(endpoints.certification.risk(providerId)),

  getConsistencyScore: (providerId) => get(endpoints.certification.consistency(providerId)),

  getQualityScore: (providerId) => get(endpoints.certification.quality(providerId)),

  getResult: (providerId) => get(endpoints.certification.result(providerId)),

  getHistory: (providerId, params) => get(endpoints.certification.history(providerId), { params }),
};

export default certificationApi;