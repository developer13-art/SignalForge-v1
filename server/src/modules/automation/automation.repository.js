/**
 * Automation Repository
 *
 * @module signalforge/server/modules/automation/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class AutomationRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createRule(data) {
    const result = await this.db.query(
      `INSERT INTO automation_rules (
         user_id, name, description, scope, provider_id, symbol, condition,
         action, priority, enabled, stop_on_match, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING id, user_id, name, scope, provider_id, symbol, priority,
                 enabled, stop_on_match, created_at`,
      [
        data.userId,
        data.name,
        data.description || null,
        data.scope || 'GLOBAL',
        data.providerId || null,
        data.symbol || null,
        data.condition ? JSON.stringify(data.condition) : null,
        data.action ? JSON.stringify(data.action) : null,
        data.priority ?? 100,
        data.enabled !== false,
        data.stopOnMatch === true,
      ],
    );
    return result.rows[0];
  }

  async findRuleById(ruleId) {
    const result = await this.db.query(
      `SELECT id, user_id, name, description, scope, provider_id, symbol,
              condition, action, priority, enabled, stop_on_match,
              trigger_count, last_triggered_at, created_at, updated_at
         FROM automation_rules
        WHERE id = $1
        LIMIT 1`,
      [ruleId],
    );
    return result.rows[0] || null;
  }

  async findRuleByIdForUser(ruleId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, name, description, scope, provider_id, symbol,
              condition, action, priority, enabled, stop_on_match,
              trigger_count, last_triggered_at, created_at, updated_at
         FROM automation_rules
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [ruleId, userId],
    );
    return result.rows[0] || null;
  }

  async listRulesForUser(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.scope) {
      conditions.push(`scope = $${index++}`);
      values.push(filters.scope);
    }

    if (filters.enabled !== undefined) {
      conditions.push(`enabled = $${index++}`);
      values.push(filters.enabled);
    }

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.symbol) {
      conditions.push(`symbol = $${index++}`);
      values.push(filters.symbol);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, user_id, name, description, scope, provider_id, symbol,
              condition, action, priority, enabled, stop_on_match,
              trigger_count, last_triggered_at, created_at, updated_at
         FROM automation_rules
         ${where}
        ORDER BY priority DESC, created_at ASC`,
      values,
    );
    return result.rows;
  }

  async listEnabledRulesForUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, name, description, scope, provider_id, symbol,
              condition, action, priority, enabled, stop_on_match
         FROM automation_rules
        WHERE user_id = $1
          AND enabled = true
        ORDER BY priority DESC, created_at ASC`,
      [userId],
    );
    return result.rows;
  }

  async updateRule(ruleId, userId, data) {
    const fields = [];
    const values = [ruleId, userId];
    let index = 3;

    const mapping = {
      name: 'name',
      description: 'description',
      scope: 'scope',
      providerId: 'provider_id',
      symbol: 'symbol',
      priority: 'priority',
      enabled: 'enabled',
      stopOnMatch: 'stop_on_match',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.condition !== undefined) {
      fields.push(`condition = $${index++}`);
      values.push(data.condition ? JSON.stringify(data.condition) : null);
    }
    if (data.action !== undefined) {
      fields.push(`action = $${index++}`);
      values.push(data.action ? JSON.stringify(data.action) : null);
    }

    if (fields.length === 0) {
      return this.findRuleByIdForUser(ruleId, userId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE automation_rules SET ${fields.join(', ')} WHERE id = $1 AND user_id = $2`,
      values,
    );

    return this.findRuleByIdForUser(ruleId, userId);
  }

  async incrementTriggerCount(ruleId) {
    await this.db.query(
      `UPDATE automation_rules
          SET trigger_count = trigger_count + 1,
              last_triggered_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [ruleId],
    );
  }

  async deleteRule(ruleId, userId) {
    await this.db.query(
      'DELETE FROM automation_rules WHERE id = $1 AND user_id = $2',
      [ruleId, userId],
    );
  }

  async countRulesForUser(userId) {
    const result = await this.db.query(
      'SELECT COUNT(*)::int AS count FROM automation_rules WHERE user_id = $1',
      [userId],
    );
    return result.rows[0]?.count || 0;
  }

  async createTrigger(data) {
    const result = await this.db.query(
      `INSERT INTO automation_triggers (
         rule_id, user_id, trade_id, signal_id, condition_matched,
         action_executed, success, error, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, rule_id, trade_id, success, created_at`,
      [
        data.ruleId,
        data.userId,
        data.tradeId || null,
        data.signalId || null,
        data.conditionMatched ? JSON.stringify(data.conditionMatched) : null,
        data.actionExecuted ? JSON.stringify(data.actionExecuted) : null,
        data.success === true,
        data.error || null,
      ],
    );
    return result.rows[0];
  }

  async listTriggersForRule(ruleId, limit = 50) {
    const result = await this.db.query(
      `SELECT id, rule_id, user_id, trade_id, signal_id, condition_matched,
              action_executed, success, error, created_at
         FROM automation_triggers
        WHERE rule_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [ruleId, limit],
    );
    return result.rows;
  }

  async listTriggersForUser(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.success !== undefined) {
      conditions.push(`success = $${index++}`);
      values.push(filters.success);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, rule_id, user_id, trade_id, signal_id, condition_matched,
              action_executed, success, error, created_at
         FROM automation_triggers
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { triggers: result.rows, limit, offset };
  }

  async countTriggersByRule(ruleId) {
    const result = await this.db.query(
      'SELECT COUNT(*)::int AS count FROM automation_triggers WHERE rule_id = $1',
      [ruleId],
    );
    return result.rows[0]?.count || 0;
  }
}

export default AutomationRepository;