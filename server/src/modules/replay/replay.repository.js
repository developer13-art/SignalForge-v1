/**
 * Replay Repository
 *
 * Persistence layer for replay data: signal timeline events, trade
 * events, AI processing logs, risk decisions, and execution logs.
 *
 * @module server/modules/replay/replay.repository
 */

import { db } from '../../database';

export async function listSignalEvents({ signalId, limit = 500 }) {
  const { rows } = await db.query(
    `SELECT id, signal_id, event_type, actor_type, actor_id, details, created_at
       FROM signal_events
      WHERE signal_id = $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [signalId, limit],
  );
  return rows;
}

export async function listTradeEvents({ tradeId, limit = 500 }) {
  const { rows } = await db.query(
    `SELECT id, trade_id, event_type, actor_type, actor_id, details, created_at
       FROM trade_events
      WHERE trade_id = $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [tradeId, limit],
  );
  return rows;
}

export async function listAiProcessingLogs({ signalId, limit = 200 }) {
  const { rows } = await db.query(
    `SELECT id, signal_id, parser_type, model, confidence, duration_ms, input_text, output, created_at
       FROM signal_parses
      WHERE signal_id = $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [signalId, limit],
  );
  return rows;
}

export async function listRiskDecisions({ signalId, userId, limit = 200 }) {
  const conditions = [];
  const params = [];

  if (signalId) {
    params.push(signalId);
    conditions.push(`signal_id = $${params.length}`);
  }

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT id, signal_id, user_id, decision, checks, reason, duration_ms, created_at
       FROM risk_decisions
       ${where}
       ORDER BY created_at ASC
       LIMIT $${params.length + 1}`,
    [...params, limit],
  );
  return rows;
}

export async function listExecutionLogs({ tradeId, limit = 200 }) {
  const { rows } = await db.query(
    `SELECT id, trade_id, execution_request_id, attempt, status, broker_response, error, created_at
       FROM execution_logs
      WHERE trade_id = $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [tradeId, limit],
  );
  return rows;
}

export async function listSourceMessages({ providerId, signalId, limit = 200 }) {
  const conditions = [];
  const params = [];

  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }

  if (signalId) {
    params.push(signalId);
    conditions.push(`signal_id = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT id, source_type, source_id, external_message_id, text, envelope, created_at
       FROM source_messages
       ${where}
       ORDER BY created_at ASC
       LIMIT $${params.length + 1}`,
    [...params, limit],
  );
  return rows;
}

export async function listSystemEvents({ correlationId, limit = 500 }) {
  if (!correlationId) {
    return [];
  }

  const { rows } = await db.query(
    `SELECT id, event_type, source, actor_id, actor_type, payload, correlation_id, causation_id, created_at
       FROM event_store
      WHERE correlation_id = $1
      ORDER BY created_at ASC
      LIMIT $2`,
    [correlationId, limit],
  );
  return rows;
}

export async function findSignalById({ signalId }) {
  const { rows } = await db.query(
    `SELECT * FROM signals WHERE id = $1 LIMIT 1`,
    [signalId],
  );
  return rows[0] || null;
}

export async function findTradeById({ tradeId }) {
  const { rows } = await db.query(
    `SELECT * FROM trades WHERE id = $1 LIMIT 1`,
    [tradeId],
  );
  return rows[0] || null;
}

export async function findTradeIdsBySignal({ signalId }) {
  const { rows } = await db.query(
    `SELECT id FROM trades WHERE signal_id = $1`,
    [signalId],
  );
  return rows.map((row) => row.id);
}

export const replayRepository = {
  listSignalEvents,
  listTradeEvents,
  listAiProcessingLogs,
  listRiskDecisions,
  listExecutionLogs,
  listSourceMessages,
  listSystemEvents,
  findSignalById,
  findTradeById,
  findTradeIdsBySignal,
};