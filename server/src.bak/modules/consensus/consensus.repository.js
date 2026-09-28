/**
 * Consensus Repository
 *
 * @module signalforge/server/modules/consensus/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ConsensusRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createConsensus(data) {
    const result = await this.db.query(
      `INSERT INTO signal_consensus (
         symbol, normalized_symbol, direction, agreement_score, confidence_score,
         result, participant_count, window_start, window_end, strategy, weights,
         metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING id, symbol, direction, agreement_score, confidence_score, result,
                 participant_count, window_start, window_end, strategy, created_at`,
      [
        data.symbol,
        data.normalizedSymbol || data.symbol,
        data.direction || null,
        data.agreementScore ?? null,
        data.confidenceScore ?? null,
        data.result,
        data.participantCount || 0,
        data.windowStart,
        data.windowEnd,
        data.strategy || null,
        data.weights ? JSON.stringify(data.weights) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async addMember(data) {
    const result = await this.db.query(
      `INSERT INTO signal_consensus_members (
         consensus_id, signal_id, provider_id, direction, weight, confidence,
         reputation, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (consensus_id, signal_id) DO NOTHING
       RETURNING id, consensus_id, signal_id, provider_id, direction, weight, confidence`,
      [
        data.consensusId,
        data.signalId,
        data.providerId,
        data.direction,
        data.weight ?? 1,
        data.confidence ?? null,
        data.reputation ?? null,
      ],
    );
    return result.rows[0] || null;
  }

  async findConsensusById(consensusId) {
    const result = await this.db.query(
      `SELECT id, symbol, normalized_symbol, direction, agreement_score,
              confidence_score, result, participant_count, window_start, window_end,
              strategy, weights, metadata, created_at
         FROM signal_consensus
        WHERE id = $1
        LIMIT 1`,
      [consensusId],
    );
    return result.rows[0] || null;
  }

  async listMembers(consensusId) {
    const result = await this.db.query(
      `SELECT id, consensus_id, signal_id, provider_id, direction, weight,
              confidence, reputation, created_at
         FROM signal_consensus_members
        WHERE consensus_id = $1
        ORDER BY created_at ASC`,
      [consensusId],
    );
    return result.rows;
  }

  async findConsensusBySymbol(symbol, since) {
    const result = await this.db.query(
      `SELECT id, symbol, normalized_symbol, direction, agreement_score,
              confidence_score, result, participant_count, window_start, window_end,
              strategy, created_at
         FROM signal_consensus
        WHERE normalized_symbol = $1
          AND created_at >= $2
        ORDER BY created_at DESC
        LIMIT 1`,
      [symbol, since],
    );
    return result.rows[0] || null;
  }

  async listConsensus(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.symbol) {
      conditions.push(`normalized_symbol = $${index++}`);
      values.push(filters.symbol);
    }

    if (filters.result) {
      conditions.push(`result = $${index++}`);
      values.push(filters.result);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM signal_consensus ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, symbol, normalized_symbol, direction, agreement_score,
              confidence_score, result, participant_count, strategy, created_at
         FROM signal_consensus
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { consensus: result.rows, total, limit, offset };
  }

  async countByResult(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT result, COUNT(*)::int AS count
         FROM signal_consensus
         ${where}
        GROUP BY result`,
      values,
    );
    return result.rows;
  }

  async countByDirection(filters = {}) {
    const conditions = ["result = 'REACHED'"];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT direction, COUNT(*)::int AS count
         FROM signal_consensus
         ${where}
        GROUP BY direction`,
      values,
    );
    return result.rows;
  }
}

export default ConsensusRepository;