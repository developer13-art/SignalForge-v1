/**
 * Management Profile Service
 *
 * @module signalforge/server/modules/provider-dna/profile/management-profile
 */

import { DnaRepository } from '../dna.repository.js';

export class ManagementProfileService {
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
      tradeManagementStyle: dna.trade_management_style,
    };
  }

  getDominantIntent(tradeManagementStyle) {
    if (!tradeManagementStyle || !tradeManagementStyle.distribution) {
      return null;
    }
    let dominant = null;
    let highest = 0;
    for (const [intent, ratio] of Object.entries(tradeManagementStyle.distribution)) {
      if (ratio > highest) {
        dominant = intent;
        highest = ratio;
      }
    }
    return dominant;
  }
}

export default ManagementProfileService;