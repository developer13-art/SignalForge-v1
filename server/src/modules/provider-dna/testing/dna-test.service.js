/**
 * DNA Test Service
 *
 * @module signalforge/server/modules/provider-dna/testing/service
 */

import { DnaTestRepository } from './dna-test.repository.js';
import { FastPathService } from '../learning/fast-path.service.js';
import { emitDnaTestCompleted } from '../dna.events.js';

export class DnaTestService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DnaTestRepository();
    this.fastPath = dependencies.fastPath || new FastPathService();
  }

  async runTest(providerId, inputText, meta = {}) {
    const start = Date.now();
    const result = await this.fastPath.apply(providerId, { text: inputText }, meta);
    const durationMs = Date.now() - start;

    const outcome = result.hit ? 'HIT' : 'MISS';

    const stored = await this.repository.create({
      providerId,
      inputText,
      matchedRules: result.rule ? [result.rule] : [],
      outcome,
      confidence: result.confidence ?? null,
      durationMs,
      createdBy: meta.userId || null,
    });

    await emitDnaTestCompleted(providerId, {
      outcome,
      confidence: result.confidence,
      durationMs,
    });

    return {
      id: stored.id,
      outcome,
      result,
      durationMs,
    };
  }

  async listTests(providerId, limit) {
    const rows = await this.repository.listByProvider(providerId, limit);
    return rows.map((row) => this.serialize(row));
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerId: row.provider_id,
      inputText: row.input_text,
      matchedRules: row.matched_rules,
      outcome: row.outcome,
      confidence: row.confidence,
      durationMs: row.duration_ms,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}

export default DnaTestService;