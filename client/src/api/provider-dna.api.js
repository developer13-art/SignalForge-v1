/**
 * Provider DNA API
 *
 * @module client/src/api/provider-dna.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const providerDnaApi = {
  list: () => get(endpoints.providerDna.list),

  getProfile: (providerId) => get(endpoints.providerDna.profile(providerId)),

  getLanguageProfile: (providerId) => get(endpoints.providerDna.language(providerId)),

  getSymbolMappings: (providerId) => get(endpoints.providerDna.symbols(providerId)),

  getAbbreviationMappings: (providerId) =>
    get(endpoints.providerDna.abbreviations(providerId)),

  getManagementRules: (providerId) =>
    get(endpoints.providerDna.managementRules(providerId)),

  getRiskBehavior: (providerId) => get(endpoints.providerDna.riskBehavior(providerId)),

  getLearnedPatterns: (providerId) => get(endpoints.providerDna.patterns(providerId)),

  getConfidence: (providerId) => get(endpoints.providerDna.confidence(providerId)),

  getVersionHistory: (providerId) => get(endpoints.providerDna.versions(providerId)),

  getTrainingMessages: (providerId, params) =>
    get(endpoints.providerDna.trainingMessages(providerId), { params }),

  testMessage: (providerId, payload) =>
    post(endpoints.providerDna.test(providerId), payload),
};

export default providerDnaApi;