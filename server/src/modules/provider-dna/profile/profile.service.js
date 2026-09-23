/**
 * Profile Service
 *
 * @module signalforge/server/modules/provider-dna/profile/service
 */

import { LanguageProfileService } from './language-profile.service.js';
import { SymbolProfileService } from './symbol-profile.service.js';
import { RiskProfileService } from './risk-profile.service.js';
import { ManagementProfileService } from './management-profile.service.js';
import { ReliabilityProfileService } from './reliability-profile.service.js';

export class ProfileService {
  constructor(dependencies = {}) {
    this.language = dependencies.language || new LanguageProfileService();
    this.symbol = dependencies.symbol || new SymbolProfileService();
    this.risk = dependencies.risk || new RiskProfileService();
    this.management = dependencies.management || new ManagementProfileService();
    this.reliability = dependencies.reliability || new ReliabilityProfileService();
  }

  async buildFullProfile(providerId) {
    const [language, symbol, risk, management, reliability] = await Promise.all([
      this.language.build(providerId),
      this.symbol.build(providerId),
      this.risk.build(providerId),
      this.management.build(providerId),
      this.reliability.build(providerId),
    ]);

    return {
      providerId,
      language,
      symbol,
      risk,
      management,
      reliability,
    };
  }

  async buildLanguageProfile(providerId) {
    return this.language.build(providerId);
  }

  async buildSymbolProfile(providerId) {
    return this.symbol.build(providerId);
  }

  async buildRiskProfile(providerId) {
    return this.risk.build(providerId);
  }

  async buildManagementProfile(providerId) {
    return this.management.build(providerId);
  }

  async buildReliabilityProfile(providerId) {
    return this.reliability.build(providerId);
  }
}

export default ProfileService;