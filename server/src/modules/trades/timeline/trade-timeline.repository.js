/**
 * Trade Timeline Repository
 *
 * @module signalforge/server/modules/trades/timeline/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class TradeTimelineRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO trade_events (
         trade_id, user_id, event_type, actor, actor_id, previous_state,
         new_state, payload, severity, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, trade_id, event_type, actor, previous_state, new_state,
                 severity, created_at`,
      [
        data.tradeId,
        data.userId || null,
        data.eventType,
        data.actor || 'SYSTEM',
        data.actorId || null,
        data.previousState || null,
        data.newState || null,
        data.payload ? JSON.stringify(data.payload) : null,
        data.severity || 'info',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listByTrade(tradeId, filters = {}, pagination = {}) {
    const conditions = ['trade_id = $1'];
    const values = [tradeId];
    let index = 2;

    if (filters.eventType) {
      conditions.push(`event_type = $${index++}`);
      values.push(filters.eventType);
    }

    if (filters.actor) {
      conditions.push(`actor = $${index++}`);
      values.push(filters.actor);
    }

    if (filters.severity) {
      conditions.push(`severity = $${index++}`);
      values.push(filters.severity);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 100, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, trade_id, user_id, event_type, actor, actor_id, previous_state,
              new_state, payload, severity, metadata, created_at
         FROM trade_events
         ${where}
        ORDER BY created_at ASC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { events: result.rows, limit, offset };
  }

  async findLatest(tradeId) {
    const result = await this.db.query(
      `SELECT id, trade_id, event_type, actor, previous_state, new_state,
              severity, created_at
         FROM trade_events
        WHERE trade_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [tradeId],
    );
    return result.rows[0] || null;
  }
}

export default TradeTimelineRepository;