/**
 * DNA Test Repository
 *
 * @module signalforge/server/modules/provider-dna/testing/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class DnaTestRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO provider_dna_tests (
         provider_id, input_text, matched_rules, outcome, confidence, duration_ms,
         created_by, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, provider_id, outcome, confidence, duration_ms, created_at`,
      [
        data.providerId,
        data.inputText,
        data.matchedRules ? JSON.stringify(data.matchedRules) : null,
        data.outcome,
        data.confidence ?? null,
        data.durationMs ?? null,
        data.createdBy || null,
      ],
    );
    return result.rows[0];
  }

  async listByProvider(providerId, limit = 50) {
    const result = await this.db.query(
      `SELECT id, provider_id, input_text, matched_rules, outcome, confidence,
              duration_ms, created_by, created_at
         FROM provider_dna_tests
        WHERE provider_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [providerId, limit],
    );
    return result.rows;
  }

  async findById(testId) {
    const result = await this.db.query(
      `SELECT id, provider_id, input_text, matched_rules, outcome, confidence,
              duration_ms, created_by, created_at
         FROM provider_dna_tests
        WHERE id = $1
        LIMIT 1`,
      [testId],
    );
    return result.rows[0] || null;
  }
}

export default DnaTestRepository;