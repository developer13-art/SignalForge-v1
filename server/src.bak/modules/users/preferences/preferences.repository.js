/**
 * Preferences Repository
 *
 * @module signalforge/server/modules/users/preferences/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class PreferencesRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, language, timezone, currency, theme,
              email_notifications, push_notifications, sms_notifications,
              marketing_emails, security_alerts, auto_trading_enabled,
              default_account_type, default_risk_percent, default_lot_size,
              extra, created_at, updated_at
         FROM user_preferences
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async createDefaults(userId) {
    const result = await this.db.query(
      `INSERT INTO user_preferences (user_id, language, timezone, currency, theme, created_at, updated_at)
       VALUES ($1, 'en', 'UTC', 'USD', 'system', NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id, user_id, language, timezone, currency, theme`,
      [userId],
    );
    return result.rows[0] || this.findByUserId(userId);
  }

  async update(userId, data) {
    const fields = [];
    const values = [userId];
    let index = 2;

    const mapping = {
      language: 'language',
      timezone: 'timezone',
      currency: 'currency',
      theme: 'theme',
      emailNotifications: 'email_notifications',
      pushNotifications: 'push_notifications',
      smsNotifications: 'sms_notifications',
      marketingEmails: 'marketing_emails',
      securityAlerts: 'security_alerts',
      autoTradingEnabled: 'auto_trading_enabled',
      defaultAccountType: 'default_account_type',
      defaultRiskPercent: 'default_risk_percent',
      defaultLotSize: 'default_lot_size',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.extra !== undefined) {
      fields.push(`extra = $${index++}`);
      values.push(JSON.stringify(data.extra));
    }

    if (fields.length === 0) {
      return this.findByUserId(userId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE user_preferences
          SET ${fields.join(', ')}
        WHERE user_id = $1`,
      values,
    );

    return this.findByUserId(userId);
  }
}

export default PreferencesRepository;