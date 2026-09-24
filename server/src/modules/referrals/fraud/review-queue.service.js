/**
 * Fraud Review Queue Service
 *
 * @module signalforge/server/modules/referrals/fraud/review-queue
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import {
  emitFraudReviewAssigned,
  emitFraudReviewResolved,
} from '../referral.events.js';

export class ReviewQueueService {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async listOpenFlags(filters = {}, pagination = {}) {
    const conditions = ['resolved_at IS NULL'];
    const values = [];
    let index = 1;

    if (filters.severity) {
      conditions.push(`severity = $${index++}`);
      values.push(filters.severity);
    }

    if (filters.flagType) {
      conditions.push(`flag_type = $${index++}`);
      values.push(filters.flagType);
    }

    if (filters.referrerId) {
      conditions.push(`referrer_id = $${index++}`);
      values.push(filters.referrerId);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, reward_id, flag_type, severity,
              score, description, detected_at, reviewed_by, resolved_at,
              resolution
         FROM referral_fraud_flags
         ${where}
        ORDER BY severity DESC, detected_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { flags: result.rows, limit, offset };
  }

  async assign(flagId, reviewerId) {
    const result = await this.db.query(
      `UPDATE referral_fraud_flags
          SET reviewed_by = $2,
              assigned_at = NOW()
        WHERE id = $1
          AND resolved_at IS NULL
        RETURNING id, reviewed_by, assigned_at`,
      [flagId, reviewerId],
    );
    if (result.rowCount === 0) {
      return null;
    }
    await emitFraudReviewAssigned(flagId, reviewerId);
    return result.rows[0];
  }

  async resolve(flagId, resolution, metadata = null) {
    const result = await this.db.query(
      `UPDATE referral_fraud_flags
          SET resolved_at = NOW(),
              resolution = $2,
              metadata = COALESCE($3::jsonb, metadata)
        WHERE id = $1
        RETURNING id, resolution, resolved_at`,
      [flagId, resolution, metadata ? JSON.stringify(metadata) : null],
    );
    if (result.rowCount === 0) {
      return null;
    }
    await emitFraudReviewResolved(flagId, resolution);
    return result.rows[0];
  }
}

export default ReviewQueueService;