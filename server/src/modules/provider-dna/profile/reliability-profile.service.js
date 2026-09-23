/**
 * Reliability Profile Service
 *
 * @module signalforge/server/modules/provider-dna/profile/reliability-profile
 */

import { RuleRepository } from '../rules/rule.repository.js';

export class ReliabilityProfileService {
  constructor(repository = null) {
    this.repository = repository || new RuleRepository();
  }

  async build(providerId) {
    const rules = await this.repository.listByProvider(providerId, {});
    if (rules.length === 0) {
      return {
        providerId,
        rulesTotal: 0,
        rulesEnabled: 0,
        totalUsage: 0,
        totalSuccess: 0,
        successRate: null,
        averageConfidence: null,
      };
    }

    let totalUsage = 0;
    let totalSuccess = 0;
    let totalConfidence = 0;
    let enabled = 0;

    for (const rule of rules) {
      totalUsage += rule.usage_count || 0;
      totalSuccess += rule.success_count || 0;
      totalConfidence += rule.confidence || 0;
      if (rule.enabled) {
        enabled++;
      }
    }

    return {
      providerId,
      rulesTotal: rules.length,
      rulesEnabled: enabled,
      totalUsage,
      totalSuccess,
      successRate: totalUsage > 0 ? totalSuccess / totalUsage : null,
      averageConfidence: totalConfidence / rules.length,
    };
  }
}

export default ReliabilityProfileService;