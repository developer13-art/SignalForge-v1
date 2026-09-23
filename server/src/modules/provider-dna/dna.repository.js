/**
 * Provider DNA Repository
 *
 * @module signalforge/server/modules/provider-dna/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class DnaRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findDnaByProviderId(providerId) {
    const result = await this.db.query(
      `SELECT id, provider_id, version, language, symbol_mappings, abbreviation_mappings,
              risk_style, trade_management_style, confidence, rule_count, active,
              created_at, updated_at
         FROM provider_dna
        WHERE provider_id = $1
        LIMIT 1`,
      [providerId],
    );
    return result.rows[0] || null;
  }

  async createDna(data) {
    const result = await this.db.query(
      `INSERT INTO provider_dna (
         provider_id, version, language, symbol_mappings, abbreviation_mappings,
         risk_style, trade_management_style, confidence, rule_count, active,
         created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, provider_id, version, language, confidence, rule_count, active, created_at`,
      [
        data.providerId,
        data.version || '1.0.0',
        data.language || null,
        data.symbolMappings ? JSON.stringify(data.symbolMappings) : null,
        data.abbreviationMappings ? JSON.stringify(data.abbreviationMappings) : null,
        data.riskStyle ? JSON.stringify(data.riskStyle) : null,
        data.tradeManagementStyle ? JSON.stringify(data.tradeManagementStyle) : null,
        data.confidence ?? 0.5,
        data.ruleCount ?? 0,
        data.active !== false,
      ],
    );
    return result.rows[0];
  }

  async updateDna(providerId, data) {
    const fields = [];
    const values = [providerId];
    let index = 2;

    const mapping = {
      version: 'version',
      language: 'language',
      confidence: 'confidence',
      ruleCount: 'rule_count',
      active: 'active',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.symbolMappings !== undefined) {
      fields.push(`symbol_mappings = $${index++}`);
      values.push(data.symbolMappings ? JSON.stringify(data.symbolMappings) : null);
    }
    if (data.abbreviationMappings !== undefined) {
      fields.push(`abbreviation_mappings = $${index++}`);
      values.push(data.abbreviationMappings ? JSON.stringify(data.abbreviationMappings) : null);
    }
    if (data.riskStyle !== undefined) {
      fields.push(`risk_style = $${index++}`);
      values.push(data.riskStyle ? JSON.stringify(data.riskStyle) : null);
    }
    if (data.tradeManagementStyle !== undefined) {
      fields.push(`trade_management_style = $${index++}`);
      values.push(data.tradeManagementStyle ? JSON.stringify(data.tradeManagementStyle) : null);
    }

    if (fields.length === 0) {
      return this.findDnaByProviderId(providerId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE provider_dna SET ${fields.join(', ')} WHERE provider_id = $1`,
      values,
    );

    return this.findDnaByProviderId(providerId);
  }

  async deleteDna(providerId) {
    await this.db.query(`DELETE FROM provider_dna WHERE provider_id = $1`, [providerId]);
  }

  async createRule(data) {
    const result = await this.db.query(
      `INSERT INTO provider_dna_rules (
         dna_id, provider_id, dna_version_id, rule_type, match_type, pattern,
         case_sensitive, priority, action, confidence, usage_count, success_count,
         last_used_at, enabled, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING id, dna_id, provider_id, rule_type, match_type, pattern,
                 priority, confidence, enabled, created_at`,
      [
        data.dnaId,
        data.providerId,
        data.dnaVersionId || null,
        data.ruleType,
        data.matchType || 'CONTAINS',
        data.pattern,
        data.caseSensitive === true,
        data.priority ?? 100,
        data.action ? JSON.stringify(data.action) : null,
        data.confidence ?? 1,
        data.usageCount ?? 0,
        data.successCount ?? 0,
        data.lastUsedAt || null,
        data.enabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findRuleById(ruleId) {
    const result = await this.db.query(
      `SELECT id, dna_id, provider_id, dna_version_id, rule_type, match_type, pattern,
              case_sensitive, priority, action, confidence, usage_count, success_count,
              last_used_at, enabled, created_at, updated_at
         FROM provider_dna_rules
        WHERE id = $1
        LIMIT 1`,
      [ruleId],
    );
    return result.rows[0] || null;
  }

  async findRulesByProvider(providerId, filters = {}) {
    const conditions = ['provider_id = $1'];
    const values = [providerId];
    let index = 2;

    if (filters.ruleType) {
      conditions.push(`rule_type = $${index++}`);
      values.push(filters.ruleType);
    }

    if (filters.enabled !== undefined) {
      conditions.push(`enabled = $${index++}`);
      values.push(filters.enabled);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, dna_id, provider_id, rule_type, match_type, pattern, case_sensitive,
              priority, action, confidence, usage_count, success_count, last_used_at,
              enabled, created_at, updated_at
         FROM provider_dna_rules
         ${where}
        ORDER BY priority DESC, created_at ASC`,
      values,
    );
    return result.rows;
  }

  async findEnabledRulesByProvider(providerId) {
    const result = await this.db.query(
      `SELECT id, dna_id, provider_id, rule_type, match_type, pattern, case_sensitive,
              priority, action, confidence, usage_count, success_count, enabled
         FROM provider_dna_rules
        WHERE provider_id = $1
          AND enabled = true
        ORDER BY priority DESC, confidence DESC, created_at ASC`,
      [providerId],
    );
    return result.rows;
  }

  async updateRule(ruleId, data) {
    const fields = [];
    const values = [ruleId];
    let index = 2;

    const mapping = {
      matchType: 'match_type',
      pattern: 'pattern',
      caseSensitive: 'case_sensitive',
      priority: 'priority',
      confidence: 'confidence',
      usageCount: 'usage_count',
      successCount: 'success_count',
      lastUsedAt: 'last_used_at',
      enabled: 'enabled',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.action !== undefined) {
      fields.push(`action = $${index++}`);
      values.push(data.action ? JSON.stringify(data.action) : null);
    }

    if (fields.length === 0) {
      return this.findRuleById(ruleId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE provider_dna_rules SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findRuleById(ruleId);
  }

  async incrementRuleUsage(ruleId, success) {
    await this.db.query(
      `UPDATE provider_dna_rules
          SET usage_count = usage_count + 1,
              success_count = success_count + CASE WHEN $2 = true THEN 1 ELSE 0 END,
              last_used_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [ruleId, success],
    );
  }

  async deleteRule(ruleId) {
    await this.db.query('DELETE FROM provider_dna_rules WHERE id = $1', [ruleId]);
  }

  async countRulesByProvider(providerId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM provider_dna_rules WHERE provider_id = $1`,
      [providerId],
    );
    return result.rows[0]?.count || 0;
  }

  async createVersion(data) {
    const result = await this.db.query(
      `INSERT INTO provider_dna_versions (
         dna_id, provider_id, version, snapshot, change_summary, created_by, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, dna_id, provider_id, version, created_at`,
      [
        data.dnaId,
        data.providerId,
        data.version,
        data.snapshot ? JSON.stringify(data.snapshot) : null,
        data.changeSummary || null,
        data.createdBy || null,
      ],
    );
    return result.rows[0];
  }

  async listVersions(providerId, limit = 20) {
    const result = await this.db.query(
      `SELECT id, dna_id, provider_id, version, change_summary, created_by, created_at
         FROM provider_dna_versions
        WHERE provider_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [providerId, limit],
    );
    return result.rows;
  }

  async findVersionById(versionId) {
    const result = await this.db.query(
      `SELECT id, dna_id, provider_id, version, snapshot, change_summary, created_by, created_at
         FROM provider_dna_versions
        WHERE id = $1
        LIMIT 1`,
      [versionId],
    );
    return result.rows[0] || null;
  }

  async pruneVersions(providerId, keepCount = 20) {
    const result = await this.db.query(
      `DELETE FROM provider_dna_versions
        WHERE provider_id = $1
          AND id NOT IN (
            SELECT id FROM provider_dna_versions
             WHERE provider_id = $1
             ORDER BY created_at DESC
             LIMIT $2
          )`,
      [providerId, keepCount],
    );
    return result.rowCount;
  }
}

export default DnaRepository;