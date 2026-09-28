/**
 * Preferences Service
 *
 * @module signalforge/server/modules/users/preferences/service
 */

import { PreferencesRepository } from './preferences.repository.js';
import { emitPreferencesUpdated } from '../user.events.js';

export class PreferencesService {
  constructor(repository = null) {
    this.repository = repository || new PreferencesRepository();
  }

  async get(userId) {
    let prefs = await this.repository.findByUserId(userId);
    if (!prefs) {
      prefs = await this.repository.createDefaults(userId);
    }
    return this.serialize(prefs);
  }

  async update(userId, payload) {
    let existing = await this.repository.findByUserId(userId);
    if (!existing) {
      await this.repository.createDefaults(userId);
    }
    await this.repository.update(userId, payload);
    const updated = await this.repository.findByUserId(userId);
    await emitPreferencesUpdated(userId);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      language: row.language,
      timezone: row.timezone,
      currency: row.currency,
      theme: row.theme,
      emailNotifications: row.email_notifications,
      pushNotifications: row.push_notifications,
      smsNotifications: row.sms_notifications,
      marketingEmails: row.marketing_emails,
      securityAlerts: row.security_alerts,
      autoTradingEnabled: row.auto_trading_enabled,
      defaultAccountType: row.default_account_type,
      defaultRiskPercent: row.default_risk_percent,
      defaultLotSize: row.default_lot_size,
      extra: row.extra,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default PreferencesService;