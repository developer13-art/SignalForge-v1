/**
 * Self-Referral Check
 *
 * @module signalforge/server/modules/referrals/fraud/self-referral
 */

import { FRAUD_FLAG_TYPES, FRAUD_FLAG_SEVERITIES } from '../referral.constants.js';

export class SelfReferralCheck {
  constructor() {
    this.name = FRAUD_FLAG_TYPES.SELF_REFERRAL;
  }

  async run(referrerId, referredUserId) {
    const detected = String(referrerId) === String(referredUserId);
    return {
      flagType: this.name,
      detected,
      severity: FRAUD_FLAG_SEVERITIES.CRITICAL,
      score: detected ? 1 : 0,
      description: detected ? 'Referrer and referred user are the same account' : null,
    };
  }
}

export default SelfReferralCheck;