/**
 * AI Signal Intelligence Repository
 *
 * @module signalforge/server/modules/ai-signal-intelligence/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class AiRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createSignalParse(data) {
    const result = await this.db.query(
      `INSERT INTO signal_parses (
         signal_id, message_id, source_id, user_id, parser_type, parser_version,
         ai_model, confidence_score, latency_ms, extracted_fields, raw_response,
         metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING id, signal_id, parser_type, parser_version, confidence_score, latency_ms, created_at`,
      [
        data.signalId || null,
        data.messageId || null,
        data.sourceId || null,
        data.userId || null,
        data.parserType,
        data.parserVersion || null,
        data.aiModel || null,
        data.confidenceScore,
        data.latencyMs || null,
        data.extractedFields ? JSON.stringify(data.extractedFields) : null,
        data.rawResponse ? JSON.stringify(data.rawResponse) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findSignalParseById(parseId) {
    const result = await this.db.query(
      `SELECT id, signal_id, message_id, source_id, user_id, parser_type, parser_version,
              ai_model, confidence_score, latency_ms, extracted_fields, raw_response,
              metadata, created_at
         FROM signal_parses
        WHERE id = $1
        LIMIT 1`,
      [parseId],
    );
    return result.rows[0] || null;
  }

  async findSignalParsesByMessage(messageId) {
    const result = await this.db.query(
      `SELECT id, signal_id, parser_type, parser_version, ai_model, confidence_score,
              latency_ms, created_at
         FROM signal_parses
        WHERE message_id = $1
        ORDER BY created_at DESC`,
      [messageId],
    );
    return result.rows;
  }

  async findLatestSignalParseBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, message_id, parser_type, parser_version, ai_model,
              confidence_score, latency_ms, extracted_fields, metadata, created_at
         FROM signal_parses
        WHERE signal_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [signalId],
    );
    return result.rows[0] || null;
  }

  async listSignalParses(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.parserType) {
      conditions.push(`parser_type = $${index++}`);
      values.push(filters.parserType);
    }

    if (filters.minConfidence !== undefined) {
      conditions.push(`confidence_score >= $${index++}`);
      values.push(filters.minConfidence);
    }

    if (filters.maxConfidence !== undefined) {
      conditions.push(`confidence_score <= $${index++}`);
      values.push(filters.maxConfidence);
    }

    if (filters.sourceId) {
      conditions.push(`source_id = $${index++}`);
      values.push(filters.sourceId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM signal_parses ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, signal_id, message_id, source_id, user_id, parser_type,
              parser_version, ai_model, confidence_score, latency_ms, created_at
         FROM signal_parses
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { parses: result.rows, total, limit, offset };
  }

  async createAiLog(data) {
    const result = await this.db.query(
      `INSERT INTO ai_logs (
         user_id, message_id, provider, model, purpose, prompt_tokens, completion_tokens,
         total_tokens, latency_ms, cost_usd, status, error, request_id, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING id, created_at`,
      [
        data.userId || null,
        data.messageId || null,
        data.provider,
        data.model,
        data.purpose || null,
        data.promptTokens || 0,
        data.completionTokens || 0,
        data.totalTokens || 0,
        data.latencyMs || null,
        data.costUsd ?? null,
        data.status,
        data.error || null,
        data.requestId || null,
      ],
    );
    return result.rows[0];
  }

  async createConfidenceScore(data) {
    const result = await this.db.query(
      `INSERT INTO ai_confidence_scores (
         signal_id, message_id, confidence, level, model, factors, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, signal_id, confidence, level, created_at`,
      [
        data.signalId || null,
        data.messageId || null,
        data.confidence,
        data.level,
        data.model || null,
        data.factors ? JSON.stringify(data.factors) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findConfidenceScoreBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, message_id, confidence, level, model, factors, metadata, created_at
         FROM ai_confidence_scores
        WHERE signal_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [signalId],
    );
    return result.rows[0] || null;
  }

  async averageConfidence(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.model) {
      conditions.push(`model = $${index++}`);
      values.push(filters.model);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT AVG(confidence)::numeric AS average, COUNT(*)::int AS count
         FROM ai_confidence_scores
         ${where}`,
      values,
    );

    const row = result.rows[0];
    return {
      average: row?.average !== null ? Number(row.average) : null,
      count: row?.count || 0,
    };
  }

  async sumAiCost(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`created_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT COALESCE(SUM(cost_usd), 0)::numeric AS total,
              COUNT(*)::int AS requests,
              COALESCE(SUM(total_tokens), 0)::bigint AS tokens
         FROM ai_logs
         ${where}`,
      values,
    );

    const row = result.rows[0] || {};
    return {
      totalCostUsd: Number(row.total || 0),
      requests: row.requests || 0,
      totalTokens: Number(row.tokens || 0),
    };
  }

  async listAiLogs(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.provider) {
      conditions.push(`provider = $${index++}`);
      values.push(filters.provider);
    }

    if (filters.model) {
      conditions.push(`model = $${index++}`);
      values.push(filters.model);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, user_id, message_id, provider, model, purpose, prompt_tokens,
              completion_tokens, total_tokens, latency_ms, cost_usd, status, error, created_at
         FROM ai_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { logs: result.rows, limit, offset };
  }
}

export default AiRepository;