/**
 * Automation API
 *
 * @module client/src/api/automation.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const automationApi = {
  listRules: (params) => get(endpoints.automation.rules, { params }),

  createRule: (payload) => post(endpoints.automation.createRule, payload),

  getRule: (ruleId) => get(endpoints.automation.rule(ruleId)),

  updateRule: (ruleId, payload) => patch(endpoints.automation.updateRule(ruleId), payload),

  deleteRule: (ruleId) => del(endpoints.automation.deleteRule(ruleId)),

  testRule: (ruleId, payload) => post(endpoints.automation.testRule(ruleId), payload),

  listProviderRules: (params) => get(endpoints.automation.providerRules, { params }),
};

export default automationApi;