/**
 * Duplicate Account Check
 *
 * @module signalforge/server/modules/referrals/fraud/duplicate-account
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { FRAUD_FLAG_TYPES, FRAUD_FLAG_SEVERITIES } from '../referral.constants.js';

export class DuplicateAccountCheck {
  constructor(db = null) {
    this.db = db || getDatabase();
    this.name = FRAUD_FLAG_TYPES.DUPLICATE_ACCOUNT;
  }

  async run(referrerId, referredUserId) {
    const result = await this.db.query(
      `SELECT r1.referrer_id, r2.referrer_id AS other_referrer
         FROM referral_relationships r1
         JOIN referral_relationships r2
           ON r1.referred_user_id = r2.referred_user_id
        WHERE r1.referrer_id = $1
          AND r2.referrer_id != $1
        LIMIT 1`,
      [referrerId],
    );

    const userResult = await this.db.query(
      `SELECT email, phone FROM users WHERE id = $1 LIMIT 1`,
      [referredUserId],
    );

    const user = userResult.rows[0] || null;
    if (!user) {
      return {
        flagType: this.name,
        detected: false,
        severity: FRAUD_FLAG_SEVERITIES.LOW,
        score: 0,
      };
    }

    const sharedEmailCheck = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM users
        WHERE id != $1 AND email = $2`,
      [referredUserId, user.email],
    );

    const sharedPhoneCheck = user.phone
      ? await this.db.query(
          `SELECT COUNT(*)::int AS count FROM users
            WHERE id != $1 AND phone = $2`,
          [referredUserId, user.phone],
        )
      : { rows: [{ count: 0 }] };

    const sharedEmail = (sharedEmailCheck.rows[0]?.count || 0) > 0;
    const sharedPhone = (sharedPhoneCheck.rows[0]?.count || 0) > 0;

    const detected = sharedEmail || sharedPhone;

    return {
      flagType: this.name,
      detected,
      severity: detected ? FRAUD_FLAG_SEVERITIES.HIGH : FRAUD_FLAG_SEVERITIES.LOW,
      score: detected ? 0.8 : 0,
      description: detected
        ? 'Referred user shares email or phone with an existing account'
        : null,
    };
  }
}

export default DuplicateAccountCheck;