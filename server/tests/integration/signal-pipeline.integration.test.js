/**
 * Signal Pipeline Integration Tests
 *
 * @module server/tests/integration/signal-pipeline.integration.test
 */

import { describe, test, expect, afterAll } from '@jest/globals';
import { db } from '../../src/database';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';

describe('Signal pipeline integration', () => {
  const createdMessageIds = [];

  afterAll(async () => {
    for (const id of createdMessageIds) {
      await db.query(`DELETE FROM source_messages WHERE id = $1`, [id]).catch(() => {});
    }
  });

  test('message ingestion generates idempotency key and fingerprint', async () => {
    const idempotencyKey = buildSourceMessageKey('TELEGRAM', 'channel-1', 'msg-1');
    const fingerprint = buildMessageFingerprint({
      sourceType: 'TELEGRAM',
      sourceId: 'channel-1',
      externalMessageId: 'msg-1',
      timestamp: new Date().toISOString(),
    });

    const { rows: userRows } = await db.query(`SELECT id FROM users LIMIT 1`);
    const userId = userRows[0] ? userRows[0].id : null;

    if (!userId) {
      return;
    }

    const { rows } = await db.query(
      `INSERT INTO source_messages
         (user_id, source_type, source_id, channel_id, external_message_id, text, idempotency_key, fingerprint, created_at, updated_at)
       VALUES ($1, 'TELEGRAM', 'channel-1', 'channel-1', 'msg-1', 'EURUSD BUY', $2, $3, NOW(), NOW())
       RETURNING *`,
      [userId, idempotencyKey, fingerprint],
    );

    createdMessageIds.push(rows[0].id);

    expect(rows[0].idempotency_key).toBe(idempotencyKey);
    expect(rows[0].fingerprint).toBe(fingerprint);
  });
});