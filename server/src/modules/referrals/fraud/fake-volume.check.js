/**
 * Fake Volume Check
 *
 * @module signalforge/server/modules/referrals/fraud/fake-volume
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { FRAUD_FLAG_TYPES, FRAUD_FLAG_SEVERITIES } from '../referral.constants.js';

const SAME_SIZE_THRESHOLD = 0.9;
const MIN_TRADES_TO_CHECK = 20;

export class FakeVolumeCheck {
  constructor(db = null) {
    this.db = db || getDatabase();
    this.name = FRAUD_FLAG_TYPES.FAKE_VOLUME;
  }

  async run(referredUserId, settlementPeriod) {
    const periodStart = `${settlementPeriod}-01`;
    const periodEnd = `${settlementPeriod}-31`;

    const result = await this.db.query(
      `SELECT volume, COUNT(*)::int AS count, COUNT(DISTINCT volume)::int AS distinct_volumes
         FROM trades
        WHERE user_id = $1
          AND status IN ('CLOSED', 'ARCHIVED')
          AND closed_at >= $2::date
          AND closed_at <= $3::date
        GROUP BY volume
        ORDER BY count DESC
        LIMIT 1`,
      [referredUserId, periodStart, periodEnd],
    );

    const totalResult = await this.db.query(
      `SELECT COUNT(*)::int AS total
         FROM trades
        WHERE user_id = $1
          AND status IN ('CLOSED', 'ARCHIVED')
          AND closed_at >= $2::date
          AND closed_at <= $3::date`,
      [referredUserId, periodStart, periodEnd],
    );

    const total = totalResult.rows[0]?.total || 0;
    if (total < MIN_TRADES_TO_CHECK) {
      return {
        flagType: this.name,
        detected: false,
        severity: FRAUD_FLAG_SEVERITIES.LOW,
        score: 0,
      };
    }

    const dominant = result.rows[0] || { count: 0, distinct_volumes: 0 };
    const ratio = dominant.count / total;
    const detected = ratio >= SAME_SIZE_THRESHOLD && dominant.distinct_volumes <= 2;

    return {
      flagType: this.name,
      detected,
      severity: detected ? FRAUD_FLAG_SEVERITIES.HIGH : FRAUD_FLAG_SEVERITIES.LOW,
      score: detected ? Number(ratio.toFixed(4)) : 0,
      description: detected
        ? 'Trading volume pattern suggests manufactured activity'
        : null,
      details: { dominantVolumeCount: dominant.count, totalTrades: total, ratio },
    };
  }
}

export default FakeVolumeCheck;