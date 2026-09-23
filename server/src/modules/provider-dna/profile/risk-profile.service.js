/**
 * Risk Profile Service
 *
 * @module signalforge/server/modules/provider-dna/profile/risk-profile
 */

import { DnaRepository } from '../dna.repository.js';

export class RiskProfileService {
  constructor(repository = null) {
    this.repository = repository || new DnaRepository();
  }

  async build(providerId) {
    const dna = await this.repository.findDnaByProviderId(providerId);
    if (!dna) {
      return null;
    }
    return {
      providerId,
      riskStyle: dna.risk_style,
    };
  }

  classify(riskStyle) {
    if (!riskStyle || !riskStyle.average) {
      return 'UNCLASSIFIED';
    }
    if (riskStyle.average < 0.5) {
      return 'CONSERVATIVE';
    }
    if (riskStyle.average < 1.5) {
      return 'MODERATE';
    }
    if (riskStyle.average < 3) {
      return 'AGGRESSIVE';
    }
    return 'VERY_AGGRESSIVE';
  }
}

export default RiskProfileService;