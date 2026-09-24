/**
 * AI Intelligence API
 *
 * @module client/src/api/ai.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const aiApi = {
  getOverview: () => get(endpoints.ai.overview),

  parseMessage: (payload) => post(endpoints.ai.parse, payload),

  getInterpretation: (signalId) => get(endpoints.ai.interpretation(signalId)),

  getLearningActivity: (params) => get(endpoints.ai.learningActivity, { params }),

  getConfidenceEngine: (params) => get(endpoints.ai.confidenceEngine, { params }),

  getRiskIntelligence: (params) => get(endpoints.ai.riskIntelligence, { params }),

  getMultilingualStats: () => get(endpoints.ai.multilingual),

  getConsensusEngine: (params) => get(endpoints.ai.consensusEngine, { params }),

  getDuplicateDetection: (params) => get(endpoints.ai.duplicateDetection, { params }),

  getProcessingLogs: (params) => get(endpoints.ai.processingLogs, { params }),

  getModelPerformance: () => get(endpoints.ai.modelPerformance),

  getLearningHistory: (params) => get(endpoints.ai.learningHistory, { params }),
};

export default aiApi;