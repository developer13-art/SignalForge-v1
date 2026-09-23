/**
 * Provider Disabled Check
 *
 * @module signalforge/server/modules/risk/checks/provider-disabled
 */

import { BaseCheck } from './base.check.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskLimitHit } from '../risk.events.js';

export class ProviderDisabledCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.PROVIDER_DISABLED);
  }

  async run(context) {
    const { profile, userId, signal } = context;

    if (!profile) {
      return this.pass();
    }

    const providerId = signal?.providerId;
    if (!providerId) {
      return this.skip('NO_PROVIDER');
    }

    if (Array.isArray(profile.blocked_providers) && profile.blocked_providers.includes(providerId)) {
      await emitRiskLimitHit(userId, 'PROVIDER_DISABLED', { providerId });
      return this.fail(
        `Provider ${providerId} is disabled in the risk profile`,
        { providerId },
      );
    }

    if (
      Array.isArray(profile.allowed_providers) &&
      profile.allowed_providers.length > 0 &&
      !profile.allowed_providers.includes(providerId)
    ) {
      await emitRiskLimitHit(userId, 'PROVIDER_DISABLED', { providerId });
      return this.fail(
        `Provider ${providerId} is not in the allowed providers list`,
        { providerId },
      );
    }

    return this.pass();
  }
}

export default ProviderDisabledCheck;