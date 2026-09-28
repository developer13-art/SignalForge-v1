/**
 * Abnormal Activity Check
 *
 * @module signalforge/server/modules/referrals/fraud/abnormal-activity
 */

import { FRAUD_FLAG_TYPES, FRAUD_FLAG_SEVERITIES } from '../referral.constants.js';

const HIGH_TRADE_COUNT_THRESHOLD = 500;
const HIGH_REFERRAL_GROWTH_THRESHOLD = 50;
const WINDOW_HOURS = 24;

export class AbnormalActivityCheck {
  constructor() {
    this.name = FRAUD_FLAG_TYPES.ABNORMAL_ACTIVITY;
  }

  async run({ referredUserTradeCount, referrerRecentReferrals, hoursSinceSignup }) {
    const flags = [];

    if (Number(referredUserTradeCount || 0) >= HIGH_TRADE_COUNT_THRESHOLD) {
      flags.push('HIGH_TRADE_COUNT');
    }

    if (Number(referrerRecentReferrals || 0) >= HIGH_REFERRAL_GROWTH_THRESHOLD) {
      flags.push('RAPID_REFERRAL_GROWTH');
    }

    if (Number(hoursSinceSignup || 24) <= WINDOW_HOURS) {
      flags.push('RAPID_ACTIVITY_AFTER_SIGNUP');
    }

    const detected = flags.length >= 2;
    const score = Math.min(1, flags.length / 3);

    return {
      flagType: this.name,
      detected,
      severity: detected
        ? flags.length >= 3
          ? FRAUD_FLAG_SEVERITIES.HIGH
          : FRAUD_FLAG_SEVERITIES.MEDIUM
        : FRAUD_FLAG_SEVERITIES.LOW,
      score: Number(score.toFixed(4)),
      description: detected ? `Abnormal activity: ${flags.join(', ')}` : null,
      details: { flags },
    };
  }
}

export default AbnormalActivityCheck;