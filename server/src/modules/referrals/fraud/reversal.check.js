/**
 * Reversal Pattern Check
 *
 * @module signalforge/server/modules/referrals/fraud/reversal
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { FRAUD_FLAG_TYPES, FRAUD_FLAG_SEVERITIES } from '../referral.constants.js';

const REVERSAL_RATIO_THRESHOLD = 0.3;
const MIN_TRADES_TO_CHECK = 10;

export class ReversalCheck {
  constructor(db = null) {
    this.db = db || getDatabase();
    this.name = FRAUD_FLAG_TYPES.REVERSAL_PATTERN;
  }

  async run(referredUserId, settlementPeriod) {
    const periodStart = `${settlementPeriod}-01`;
    const periodEnd = `${settlementPeriod}-31`;

    const result = await this.db.query(
      `SELECT
         COUNT(*)::int AS total,
         COALESCE(SUM(CASE WHEN realized_profit < 0 THEN 1 ELSE 0 END), 0)::int AS losses,
         COALESCE(SUM(CASE WHEN realized_profit > 0 THEN 1 ELSE 0 END), 0)::int AS wins
         FROM trades
        WHERE user_id = $1
          AND status IN ('CLOSED', 'ARCHIVED')
          AND closed_at >= $2::date
          AND closed_at <= $3::date`,
      [referredUserId, periodStart, periodEnd],
    );

    const row = result.rows[0] || {};
    const total = Number(row.total || 0);
    if (total < MIN_TRADES_TO_CHECK) {
      return {
        flagType: this.name,
        detected: false,
        severity: FRAUD_FLAG_SEVERITIES.LOW,
        score: 0,
      };
    }

    const losses = Number(row.losses || 0);
    const lossRatio = losses / total;
    const detected = lossRatio >= REVERSAL_RATIO_THRESHOLD && Number(row.wins || 0) === 0;

    return {
      flagType: this.name,
      detected,
      severity: detected ? FRAUD_FLAG_SEVERITIES.HIGH : FRAUD_FLAG_SEVERITIES.LOW,
      score: detected ? Number(lossRatio.toFixed(4)) : 0,
      description: detected
        ? 'Reversal trading pattern detected with no winning trades'
        : null,
      details: { totalTrades: total, losses, lossRatio },
    };
  }
}

export default ReversalCheck;