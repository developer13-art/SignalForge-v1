/**
 * Broker Repository
 *
 * @module signalforge/server/modules/brokers/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class BrokerRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findBrokerById(brokerId) {
    const result = await this.db.query(
      `SELECT id, name, platform, server, country, website, description,
              is_active, metadata, created_at, updated_at
         FROM brokers
        WHERE id = $1
        LIMIT 1`,
      [brokerId],
    );
    return result.rows[0] || null;
  }

  async findBrokerByNameAndServer(name, server) {
    const result = await this.db.query(
      `SELECT id, name, platform, server, country, website, description,
              is_active, metadata, created_at, updated_at
         FROM brokers
        WHERE name = $1 AND server = $2
        LIMIT 1`,
      [name, server],
    );
    return result.rows[0] || null;
  }

  async listBrokers(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.platform) {
      conditions.push(`platform = $${index++}`);
      values.push(filters.platform);
    }

    if (filters.active !== undefined) {
      conditions.push(`is_active = $${index++}`);
      values.push(filters.active);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT id, name, platform, server, country, website, description,
              is_active, metadata, created_at, updated_at
         FROM brokers
         ${where}
        ORDER BY name ASC`,
      values,
    );
    return result.rows;
  }

  async createBroker(data) {
    const result = await this.db.query(
      `INSERT INTO brokers (
         name, platform, server, country, website, description, is_active,
         metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, name, platform, server, is_active, created_at`,
      [
        data.name,
        data.platform,
        data.server || null,
        data.country || null,
        data.website || null,
        data.description || null,
        data.isActive !== false,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async updateBroker(brokerId, data) {
    const fields = [];
    const values = [brokerId];
    let index = 2;

    const mapping = {
      name: 'name',
      platform: 'platform',
      server: 'server',
      country: 'country',
      website: 'website',
      description: 'description',
      isActive: 'is_active',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findBrokerById(brokerId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE brokers SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findBrokerById(brokerId);
  }

  async deleteBroker(brokerId) {
    await this.db.query('DELETE FROM brokers WHERE id = $1', [brokerId]);
  }

  async findAccountById(accountId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_id, broker_name, platform, account_number,
              account_nickname, server, account_type, account_currency, leverage,
              status, metaapi_account_id, metaapi_region, balance, equity, margin,
              free_margin, margin_level, last_sync_at, last_error, last_error_at,
              credentials_encrypted, connected_at, disconnected_at,
              created_at, updated_at
         FROM broker_accounts
        WHERE id = $1
        LIMIT 1`,
      [accountId],
    );
    return result.rows[0] || null;
  }

  async findAccountByIdForUser(accountId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_id, broker_name, platform, account_number,
              account_nickname, server, account_type, account_currency, leverage,
              status, metaapi_account_id, metaapi_region, balance, equity, margin,
              free_margin, margin_level, last_sync_at, last_error, last_error_at,
              credentials_encrypted, connected_at, disconnected_at,
              created_at, updated_at
         FROM broker_accounts
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [accountId, userId],
    );
    return result.rows[0] || null;
  }

  async findAccountByMetaApiId(metaApiAccountId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_id, platform, account_number, server,
              status, metaapi_account_id, metaapi_region, created_at
         FROM broker_accounts
        WHERE metaapi_account_id = $1
        LIMIT 1`,
      [metaApiAccountId],
    );
    return result.rows[0] || null;
  }

  async findAccountByUserAndNumber(userId, accountNumber, server) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_id, platform, account_number, server,
              status, created_at
         FROM broker_accounts
        WHERE user_id = $1 AND account_number = $2 AND server = $3
        LIMIT 1`,
      [userId, accountNumber, server],
    );
    return result.rows[0] || null;
  }

  async listAccountsForUser(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.platform) {
      conditions.push(`platform = $${index++}`);
      values.push(filters.platform);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.accountType) {
      conditions.push(`account_type = $${index++}`);
      values.push(filters.accountType);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, user_id, broker_id, broker_name, platform, account_number,
              account_nickname, server, account_type, account_currency, leverage,
              status, metaapi_account_id, balance, equity, margin, free_margin,
              margin_level, last_sync_at, last_error, connected_at, created_at
         FROM broker_accounts
         ${where}
        ORDER BY created_at DESC`,
      values,
    );
    return result.rows;
  }

  async listConnectedAccounts() {
    const result = await this.db.query(
      `SELECT id, user_id, broker_id, platform, account_number, server,
              account_type, metaapi_account_id, metaapi_region, status,
              last_sync_at
         FROM broker_accounts
        WHERE status IN ('CONNECTED', 'SYNCHRONIZING', 'DEPLOYED')
        ORDER BY last_sync_at ASC NULLS FIRST`,
    );
    return result.rows;
  }

  async createAccount(data) {
    const result = await this.db.query(
      `INSERT INTO broker_accounts (
         user_id, broker_id, broker_name, platform, account_number, account_nickname,
         server, account_type, account_currency, leverage, status, metaapi_account_id,
         metaapi_region, credentials_encrypted, balance, equity, margin, free_margin,
         margin_level, connected_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, NOW(), NOW()
       )
       RETURNING id, user_id, broker_id, platform, account_number, server,
                 account_type, status, metaapi_account_id, created_at`,
      [
        data.userId,
        data.brokerId || null,
        data.brokerName || null,
        data.platform,
        data.accountNumber,
        data.accountNickname || null,
        data.server || null,
        data.accountType || 'DEMO',
        data.accountCurrency || null,
        data.leverage ?? null,
        data.status || 'PENDING',
        data.metaApiAccountId || null,
        data.metaApiRegion || null,
        data.credentialsEncrypted || null,
        data.balance ?? null,
        data.equity ?? null,
        data.margin ?? null,
        data.freeMargin ?? null,
        data.marginLevel ?? null,
        data.connectedAt || null,
      ],
    );
    return result.rows[0];
  }

  async updateAccount(accountId, data) {
    const fields = [];
    const values = [accountId];
    let index = 2;

    const mapping = {
      status: 'status',
      metaapiAccountId: 'metaapi_account_id',
      metaapiRegion: 'metaapi_region',
      balance: 'balance',
      equity: 'equity',
      margin: 'margin',
      freeMargin: 'free_margin',
      marginLevel: 'margin_level',
      leverage: 'leverage',
      accountCurrency: 'account_currency',
      lastSyncAt: 'last_sync_at',
      lastError: 'last_error',
      lastErrorAt: 'last_error_at',
      connectedAt: 'connected_at',
      disconnectedAt: 'disconnected_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.credentialsEncrypted !== undefined) {
      fields.push(`credentials_encrypted = $${index++}`);
      values.push(data.credentialsEncrypted || null);
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findAccountById(accountId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE broker_accounts SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findAccountById(accountId);
  }

  async deleteAccount(accountId) {
    await this.db.query('DELETE FROM broker_accounts WHERE id = $1', [accountId]);
  }

  async countAccountsForUser(userId) {
    const result = await this.db.query(
      'SELECT COUNT(*)::int AS count FROM broker_accounts WHERE user_id = $1',
      [userId],
    );
    return result.rows[0]?.count || 0;
  }

  async createSnapshot(data) {
    const result = await this.db.query(
      `INSERT INTO account_snapshots (
         broker_account_id, user_id, balance, equity, margin, free_margin,
         margin_level, open_positions, open_orders, metadata, captured_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, broker_account_id, balance, equity, captured_at`,
      [
        data.brokerAccountId,
        data.userId,
        data.balance ?? null,
        data.equity ?? null,
        data.margin ?? null,
        data.freeMargin ?? null,
        data.marginLevel ?? null,
        data.openPositions ?? null,
        data.openOrders ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listSnapshots(accountId, filters = {}, pagination = {}) {
    const conditions = ['broker_account_id = $1'];
    const values = [accountId];
    let index = 2;

    if (filters.since) {
      conditions.push(`captured_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`captured_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 100, 1), 1000);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, broker_account_id, balance, equity, margin, free_margin,
              margin_level, open_positions, open_orders, captured_at
         FROM account_snapshots
         ${where}
        ORDER BY captured_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { snapshots: result.rows, limit, offset };
  }

  async createConnectionLog(data) {
    const result = await this.db.query(
      `INSERT INTO broker_connection_logs (
         broker_account_id, user_id, event_type, status, message, details, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, event_type, status, created_at`,
      [
        data.brokerAccountId,
        data.userId,
        data.eventType,
        data.status || 'INFO',
        data.message || null,
        data.details ? JSON.stringify(data.details) : null,
      ],
    );
    return result.rows[0];
  }

  async listConnectionLogs(accountId, pagination = {}) {
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, broker_account_id, event_type, status, message, details, created_at
         FROM broker_connection_logs
        WHERE broker_account_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [accountId, limit, offset],
    );
    return { logs: result.rows, limit, offset };
  }
}

export default BrokerRepository;