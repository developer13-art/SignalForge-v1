/**
 * News Exposure Analysis Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/news-exposure
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { NEWS_EXPOSURE_THRESHOLDS } from '../intelligence.constants.js';

export class NewsExposureService {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async calculate(userId, trades) {
    if (!Array.isArray(trades) || trades.length < NEWS_EXPOSURE_THRESHOLDS.minTrades) {
      return { score: 0, detected: false, samples: trades?.length || 0 };
    }

    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM trades t
         JOIN news_calendar_events n
           ON n.affected_symbols @> ARRAY[t.normalized_symbol]::text[]
          AND t.opened_at BETWEEN n.scheduled_at - interval '15 minutes'
                              AND n.scheduled_at + interval '15 minutes'
        WHERE t.user_id = $1
          AND t.status IN ('CLOSED', 'ARCHIVED')`,
      [userId],
    );

    const newsTrades = result.rows[0]?.count || 0;
    const ratio = newsTrades / trades.length;

    const score = Number(Math.min(1, ratio / NEWS_EXPOSURE_THRESHOLDS.maxNewsRatio).toFixed(4));

    return {
      score,
      detected:
        newsTrades >= NEWS_EXPOSURE_THRESHOLDS.minNewsTrades &&
        ratio > NEWS_EXPOSURE_THRESHOLDS.maxNewsRatio,
      newsTrades,
      ratio: Number(ratio.toFixed(4)),
      samples: trades.length,
    };
  }
}

export default NewsExposureService;