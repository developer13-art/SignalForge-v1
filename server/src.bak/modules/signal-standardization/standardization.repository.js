/**
 * Signal Standardization Repository
 *
 * @module signalforge/server/modules/signal-standardization/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class StandardizationRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createSignal(data) {
    const result = await this.db.query(
      `INSERT INTO signals (
         signal_id, provider_id, source_type, source_id, raw_message_id, channel_id,
         symbol, normalized_symbol, direction, entry_type, entry_price, stop_loss,
         take_profits, risk_percent, lot_size, timeframe, classification, confidence,
         parser_type, parser_version, ai_model, dna_version, language, original_text,
         context, fingerprint, expires_at, metadata, timestamp, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
         $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, NOW(), NOW()
       )
       ON CONFLICT (signal_id) DO NOTHING
       RETURNING id, signal_id, provider_id, source_type, symbol, direction,
                 classification, confidence, fingerprint, created_at`,
      [
        data.signalId,
        data.providerId,
        data.sourceType,
        data.sourceId,
        data.rawMessageId,
        data.channelId || null,
        data.symbol,
        data.normalizedSymbol || data.symbol,
        data.direction,
        data.entryType,
        data.entryPrice ?? null,
        data.stopLoss ?? null,
        data.takeProfits ? JSON.stringify(data.takeProfits) : null,
        data.riskPercent ?? null,
        data.lotSize ?? null,
        data.timeframe || null,
        data.classification,
        data.confidence,
        data.parserType || null,
        data.parserVersion || null,
        data.aiModel || null,
        data.dnaVersion || null,
        data.language || null,
        data.originalText || null,
        data.context ? JSON.stringify(data.context) : null,
        data.fingerprint || null,
        data.expiresAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.timestamp,
      ],
    );
    return result.rows[0] || null;
  }

  async findSignalById(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, source_type, source_id, raw_message_id,
              channel_id, symbol, normalized_symbol, direction, entry_type, entry_price,
              stop_loss, take_profits, risk_percent, lot_size, timeframe, classification,
              confidence, parser_type, parser_version, ai_model, dna_version, language,
              original_text, context, fingerprint, expires_at, metadata, timestamp,
              status, created_at, updated_at
         FROM signals
        WHERE signal_id = $1
        LIMIT 1`,
      [signalId],
    );
    return result.rows[0] || null;
  }

  async findSignalByRawMessageId(rawMessageId) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, symbol, direction, classification, confidence, created_at
         FROM signals
        WHERE raw_message_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [rawMessageId],
    );
    return result.rows[0] || null;
  }

  async findSignalByFingerprint(fingerprint) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, symbol, direction, confidence, fingerprint, created_at
         FROM signals
        WHERE fingerprint = $1
        LIMIT 1`,
      [fingerprint],
    );
    return result.rows[0] || null;
  }

  async findRecentDuplicate(fingerprint, windowSeconds) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, symbol, direction, confidence, fingerprint, created_at
         FROM signals
        WHERE fingerprint = $1
          AND created_at > NOW() - ($2::int * interval '1 second')
        ORDER BY created_at DESC
        LIMIT 1`,
      [fingerprint, windowSeconds],
    );
    return result.rows[0] || null;
  }

  async listSignals(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.sourceType) {
      conditions.push(`source_type = $${index++}`);
      values.push(filters.sourceType);
    }

    if (filters.symbol) {
      conditions.push(`normalized_symbol = $${index++}`);
      values.push(filters.symbol);
    }

    if (filters.direction) {
      conditions.push(`direction = $${index++}`);
      values.push(filters.direction);
    }

    if (filters.classification) {
      conditions.push(`classification = $${index++}`);
      values.push(filters.classification);
    }

    if (filters.minConfidence !== undefined) {
      conditions.push(`confidence >= $${index++}`);
      values.push(filters.minConfidence);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM signals ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, source_type, symbol, normalized_symbol,
              direction, entry_type, entry_price, stop_loss, take_profits, timeframe,
              classification, confidence, fingerprint, status, created_at
         FROM signals
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { signals: result.rows, total, limit, offset };
  }

  async updateSignalStatus(signalId, status) {
    await this.db.query(
      `UPDATE signals SET status = $2, updated_at = NOW() WHERE signal_id = $1`,
      [signalId, status],
    );
  }

  async countByClassification(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT classification, COUNT(*)::int AS count
         FROM signals
         ${where}
        GROUP BY classification`,
      values,
    );
    return result.rows;
  }

  async countBySymbol(filters = {}, limit = 50) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT normalized_symbol AS symbol, COUNT(*)::int AS count
         FROM signals
         ${where}
        GROUP BY normalized_symbol
        ORDER BY count DESC
        LIMIT $${index}`,
      [...values, limit],
    );
    return result.rows;
  }
}

export default StandardizationRepository;