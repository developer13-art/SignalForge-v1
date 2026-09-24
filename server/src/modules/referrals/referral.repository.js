/**
 * Referral Repository
 *
 * @module signalforge/server/modules/referrals/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ReferralRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createCode(data) {
    const result = await this.db.query(
      `INSERT INTO referral_codes (
         user_id, code, is_active, usage_count, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (code) DO NOTHING
       RETURNING id, user_id, code, is_active, usage_count, created_at`,
      [
        data.userId,
        data.code,
        data.isActive !== false,
        data.usageCount ?? 0,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findCodeByCode(code) {
    const result = await this.db.query(
      `SELECT id, user_id, code, is_active, usage_count, metadata, created_at, updated_at
         FROM referral_codes
        WHERE code = $1
        LIMIT 1`,
      [code],
    );
    return result.rows[0] || null;
  }

  async findCodeByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, code, is_active, usage_count, metadata, created_at, updated_at
         FROM referral_codes
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async listCodesForUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, code, is_active, usage_count, created_at, updated_at
         FROM referral_codes
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async updateCode(codeId, data) {
    const fields = [];
    const values = [codeId];
    let index = 2;

    if (data.isActive !== undefined) {
      fields.push(`is_active = $${index++}`);
      values.push(data.isActive);
    }
    if (data.usageCount !== undefined) {
      fields.push(`usage_count = $${index++}`);
      values.push(data.usageCount);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE referral_codes SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findCodeByCode((await this.db.query(
      'SELECT code FROM referral_codes WHERE id = $1',
      [codeId],
    )).rows[0]?.code);
  }

  async incrementCodeUsage(codeId) {
    await this.db.query(
      `UPDATE referral_codes
          SET usage_count = usage_count + 1,
              updated_at = NOW()
        WHERE id = $1`,
      [codeId],
    );
  }

  async createRelationship(data) {
    const result = await this.db.query(
      `INSERT INTO referral_relationships (
         referrer_id, referred_user_id, referral_code, status,
         attribution_source, attribution_context, suspended_at,
         terminated_at, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (referred_user_id) DO NOTHING
       RETURNING id, referrer_id, referred_user_id, referral_code, status, created_at`,
      [
        data.referrerId,
        data.referredUserId,
        data.referralCode || null,
        data.status || 'ACTIVE',
        data.attributionSource || null,
        data.attributionContext ? JSON.stringify(data.attributionContext) : null,
        data.suspendedAt || null,
        data.terminatedAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findRelationshipById(relationshipId) {
    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, referral_code, status,
              attribution_source, attribution_context, suspended_at,
              terminated_at, metadata, created_at, updated_at
         FROM referral_relationships
        WHERE id = $1
        LIMIT 1`,
      [relationshipId],
    );
    return result.rows[0] || null;
  }

  async findRelationshipByReferredUser(referredUserId) {
    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, referral_code, status,
              attribution_source, created_at, updated_at
         FROM referral_relationships
        WHERE referred_user_id = $1
        LIMIT 1`,
      [referredUserId],
    );
    return result.rows[0] || null;
  }

  async listRelationshipsByReferrer(referrerId, filters = {}) {
    const conditions = ['referrer_id = $1'];
    const values = [referrerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, referral_code, status,
              attribution_source, created_at, updated_at
         FROM referral_relationships
         ${where}
        ORDER BY created_at DESC`,
      values,
    );
    return result.rows;
  }

  async countActiveReferredUsers(referrerId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM referral_relationships
        WHERE referrer_id = $1
          AND status = 'ACTIVE'`,
      [referrerId],
    );
    return result.rows[0]?.count || 0;
  }

  async updateRelationship(relationshipId, data) {
    const fields = [];
    const values = [relationshipId];
    let index = 2;

    const mapping = {
      status: 'status',
      suspendedAt: 'suspended_at',
      terminatedAt: 'terminated_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.attributionContext !== undefined) {
      fields.push(`attribution_context = $${index++}`);
      values.push(data.attributionContext ? JSON.stringify(data.attributionContext) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findRelationshipById(relationshipId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE referral_relationships SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findRelationshipById(relationshipId);
  }

  async createReward(data) {
    const result = await this.db.query(
      `INSERT INTO referral_rewards (
         referrer_id, referred_user_id, relationship_id, settlement_id,
         settlement_period, currency, gross_profit, gross_loss, eligible_costs,
         eligible_net_profit, reward_rate, reward_amount, status, fraud_score,
         fraud_flags, reviewed_by, approved_at, settled_at, rejected_at,
         rejection_reason, reversal_reason, ledger_entry_id, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
       )
       ON CONFLICT (referrer_id, referred_user_id, settlement_period) DO NOTHING
       RETURNING id, referrer_id, referred_user_id, settlement_period, reward_amount,
                 status, created_at`,
      [
        data.referrerId,
        data.referredUserId,
        data.relationshipId || null,
        data.settlementId || null,
        data.settlementPeriod,
        data.currency || 'USD',
        data.grossProfit ?? null,
        data.grossLoss ?? null,
        data.eligibleCosts ?? null,
        data.eligibleNetProfit ?? 0,
        data.rewardRate ?? 0.001,
        data.rewardAmount ?? 0,
        data.status || 'CALCULATED',
        data.fraudScore ?? null,
        data.fraudFlags ? JSON.stringify(data.fraudFlags) : null,
        data.reviewedBy || null,
        data.approvedAt || null,
        data.settledAt || null,
        data.rejectedAt || null,
        data.rejectionReason || null,
        data.reversalReason || null,
        data.ledgerEntryId || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findRewardById(rewardId) {
    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, relationship_id, settlement_id,
              settlement_period, currency, gross_profit, gross_loss, eligible_costs,
              eligible_net_profit, reward_rate, reward_amount, status, fraud_score,
              fraud_flags, reviewed_by, approved_at, settled_at, rejected_at,
              rejection_reason, reversal_reason, ledger_entry_id, metadata,
              created_at, updated_at
         FROM referral_rewards
        WHERE id = $1
        LIMIT 1`,
      [rewardId],
    );
    return result.rows[0] || null;
  }

  async findRewardByKey(referrerId, referredUserId, settlementPeriod) {
    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, settlement_id, settlement_period,
              reward_amount, status, created_at
         FROM referral_rewards
        WHERE referrer_id = $1
          AND referred_user_id = $2
          AND settlement_period = $3
        LIMIT 1`,
      [referrerId, referredUserId, settlementPeriod],
    );
    return result.rows[0] || null;
  }

  async listRewardsByReferrer(referrerId, filters = {}, pagination = {}) {
    const conditions = ['referrer_id = $1'];
    const values = [referrerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }
    if (filters.settlementPeriod) {
      conditions.push(`settlement_period = $${index++}`);
      values.push(filters.settlementPeriod);
    }
    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM referral_rewards ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, settlement_period, currency,
              eligible_net_profit, reward_rate, reward_amount, status,
              approved_at, settled_at, created_at
         FROM referral_rewards
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { rewards: result.rows, total, limit, offset };
  }

  async listRewardsForSettlement(settlementPeriod, filters = {}, pagination = {}) {
    const conditions = ['settlement_period = $1'];
    const values = [settlementPeriod];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 100, 1), 1000);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM referral_rewards ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, settlement_period, currency,
              eligible_net_profit, reward_rate, reward_amount, status,
              fraud_score, fraud_flags, created_at
         FROM referral_rewards
         ${where}
        ORDER BY created_at ASC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { rewards: result.rows, total, limit, offset };
  }

  async updateReward(rewardId, data) {
    const fields = [];
    const values = [rewardId];
    let index = 2;

    const mapping = {
      status: 'status',
      fraudScore: 'fraud_score',
      reviewedBy: 'reviewed_by',
      approvedAt: 'approved_at',
      settledAt: 'settled_at',
      rejectedAt: 'rejected_at',
      rejectionReason: 'rejection_reason',
      reversalReason: 'reversal_reason',
      ledgerEntryId: 'ledger_entry_id',
      settlementId: 'settlement_id',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.fraudFlags !== undefined) {
      fields.push(`fraud_flags = $${index++}`);
      values.push(data.fraudFlags ? JSON.stringify(data.fraudFlags) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findRewardById(rewardId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE referral_rewards SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findRewardById(rewardId);
  }

  async sumRewardsByReferrer(referrerId, filters = {}) {
    const conditions = ['referrer_id = $1'];
    const values = [referrerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }
    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'PENDING' THEN reward_amount ELSE 0 END), 0)::numeric AS pending,
         COALESCE(SUM(CASE WHEN status = 'CALCULATED' THEN reward_amount ELSE 0 END), 0)::numeric AS calculated,
         COALESCE(SUM(CASE WHEN status = 'UNDER_REVIEW' THEN reward_amount ELSE 0 END), 0)::numeric AS under_review,
         COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN reward_amount ELSE 0 END), 0)::numeric AS approved,
         COALESCE(SUM(CASE WHEN status = 'SETTLED' THEN reward_amount ELSE 0 END), 0)::numeric AS settled,
         COALESCE(SUM(CASE WHEN status = 'REJECTED' THEN reward_amount ELSE 0 END), 0)::numeric AS rejected,
         COUNT(*)::int AS count
         FROM referral_rewards
         ${where}`,
      values,
    );
    const row = result.rows[0] || {};
    return {
      pending: Number(row.pending || 0),
      calculated: Number(row.calculated || 0),
      underReview: Number(row.under_review || 0),
      approved: Number(row.approved || 0),
      settled: Number(row.settled || 0),
      rejected: Number(row.rejected || 0),
      count: row.count || 0,
    };
  }

  async createWallet(data) {
    const result = await this.db.query(
      `INSERT INTO referral_wallets (
         user_id, currency, pending_balance, available_balance,
         lifetime_earned, lifetime_withdrawn, lifetime_reversed,
         status, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (user_id, currency) DO NOTHING
       RETURNING id, user_id, currency, pending_balance, available_balance,
                 lifetime_earned, lifetime_withdrawn, lifetime_reversed,
                 status, created_at`,
      [
        data.userId,
        data.currency || 'USD',
        data.pendingBalance ?? 0,
        data.availableBalance ?? 0,
        data.lifetimeEarned ?? 0,
        data.lifetimeWithdrawn ?? 0,
        data.lifetimeReversed ?? 0,
        data.status || 'ACTIVE',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findWalletByUser(userId, currency = 'USD') {
    const result = await this.db.query(
      `SELECT id, user_id, currency, pending_balance, available_balance,
              lifetime_earned, lifetime_withdrawn, lifetime_reversed,
              status, metadata, created_at, updated_at
         FROM referral_wallets
        WHERE user_id = $1 AND currency = $2
        LIMIT 1`,
      [userId, currency],
    );
    return result.rows[0] || null;
  }

  async findWalletById(walletId) {
    const result = await this.db.query(
      `SELECT id, user_id, currency, pending_balance, available_balance,
              lifetime_earned, lifetime_withdrawn, lifetime_reversed,
              status, metadata, created_at, updated_at
         FROM referral_wallets
        WHERE id = $1
        LIMIT 1`,
      [walletId],
    );
    return result.rows[0] || null;
  }

  async updateWallet(walletId, data) {
    const fields = [];
    const values = [walletId];
    let index = 2;

    const mapping = {
      pendingBalance: 'pending_balance',
      availableBalance: 'available_balance',
      lifetimeEarned: 'lifetime_earned',
      lifetimeWithdrawn: 'lifetime_withdrawn',
      lifetimeReversed: 'lifetime_reversed',
      status: 'status',
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
      return this.findWalletById(walletId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE referral_wallets SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findWalletById(walletId);
  }

  async createLedgerEntry(data) {
    const result = await this.db.query(
      `INSERT INTO referral_ledger (
         wallet_id, user_id, entry_type, direction, amount, currency,
         balance_before, balance_after, reference_type, reference_id,
         description, related_entry_id, is_reversal, reversal_of_entry_id,
         actor_id, actor_type, status, metadata, recorded_at, created_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, NOW(), NOW()
       )
       RETURNING id, wallet_id, user_id, entry_type, direction, amount,
                 balance_after, status, recorded_at`,
      [
        data.walletId,
        data.userId,
        data.entryType,
        data.direction,
        data.amount,
        data.currency || 'USD',
        data.balanceBefore ?? null,
        data.balanceAfter ?? null,
        data.referenceType || null,
        data.referenceId || null,
        data.description || null,
        data.relatedEntryId || null,
        data.isReversal === true,
        data.reversalOfEntryId || null,
        data.actorId || null,
        data.actorType || null,
        data.status || 'POSTED',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findLedgerEntryById(entryId) {
    const result = await this.db.query(
      `SELECT id, wallet_id, user_id, entry_type, direction, amount, currency,
              balance_before, balance_after, reference_type, reference_id,
              description, related_entry_id, is_reversal, reversal_of_entry_id,
              actor_id, actor_type, status, metadata, recorded_at, created_at
         FROM referral_ledger
        WHERE id = $1
        LIMIT 1`,
      [entryId],
    );
    return result.rows[0] || null;
  }

  async listLedgerEntries(walletId, filters = {}, pagination = {}) {
    const conditions = ['wallet_id = $1'];
    const values = [walletId];
    let index = 2;

    if (filters.entryType) {
      conditions.push(`entry_type = $${index++}`);
      values.push(filters.entryType);
    }
    if (filters.direction) {
      conditions.push(`direction = $${index++}`);
      values.push(filters.direction);
    }
    if (filters.since) {
      conditions.push(`recorded_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM referral_ledger ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, wallet_id, user_id, entry_type, direction, amount, currency,
              balance_before, balance_after, reference_type, reference_id,
              description, is_reversal, reversal_of_entry_id, status, recorded_at
         FROM referral_ledger
         ${where}
        ORDER BY recorded_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { entries: result.rows, total, limit, offset };
  }

  async computeWalletBalance(walletId) {
    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN direction = 'CREDIT' AND status = 'POSTED' THEN amount ELSE 0 END), 0)::numeric AS credits,
         COALESCE(SUM(CASE WHEN direction = 'DEBIT' AND status = 'POSTED' THEN amount ELSE 0 END), 0)::numeric AS debits,
         COALESCE(SUM(CASE WHEN direction = 'CREDIT' AND status = 'POSTED' THEN amount ELSE -amount END), 0)::numeric AS net
         FROM referral_ledger
        WHERE wallet_id = $1`,
      [walletId],
    );
    const row = result.rows[0] || {};
    return {
      credits: Number(row.credits || 0),
      debits: Number(row.debits || 0),
      net: Number(row.net || 0),
    };
  }

  async createSettlement(data) {
    const result = await this.db.query(
      `INSERT INTO referral_settlements (
         settlement_period, status, started_at, completed_at, total_referrers,
         total_rewards, total_amount, currency, freeze_ended_at, summary,
         error, initiated_by, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
       )
       ON CONFLICT (settlement_period) DO NOTHING
       RETURNING id, settlement_period, status, total_rewards, total_amount,
                 started_at, created_at`,
      [
        data.settlementPeriod,
        data.status || 'SCHEDULED',
        data.startedAt || null,
        data.completedAt || null,
        data.totalReferrers ?? 0,
        data.totalRewards ?? 0,
        data.totalAmount ?? 0,
        data.currency || 'USD',
        data.freezeEndedAt || null,
        data.summary ? JSON.stringify(data.summary) : null,
        data.error || null,
        data.initiatedBy || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findSettlementById(settlementId) {
    const result = await this.db.query(
      `SELECT id, settlement_period, status, started_at, completed_at,
              total_referrers, total_rewards, total_amount, currency,
              freeze_ended_at, summary, error, initiated_by, metadata,
              created_at, updated_at
         FROM referral_settlements
        WHERE id = $1
        LIMIT 1`,
      [settlementId],
    );
    return result.rows[0] || null;
  }

  async findSettlementByPeriod(settlementPeriod) {
    const result = await this.db.query(
      `SELECT id, settlement_period, status, started_at, completed_at,
              total_referrers, total_rewards, total_amount, currency,
              freeze_ended_at, summary, error, created_at, updated_at
         FROM referral_settlements
        WHERE settlement_period = $1
        LIMIT 1`,
      [settlementPeriod],
    );
    return result.rows[0] || null;
  }

  async updateSettlement(settlementId, data) {
    const fields = [];
    const values = [settlementId];
    let index = 2;

    const mapping = {
      status: 'status',
      startedAt: 'started_at',
      completedAt: 'completed_at',
      totalReferrers: 'total_referrers',
      totalRewards: 'total_rewards',
      totalAmount: 'total_amount',
      freezeEndedAt: 'freeze_ended_at',
      error: 'error',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.summary !== undefined) {
      fields.push(`summary = $${index++}`);
      values.push(data.summary ? JSON.stringify(data.summary) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findSettlementById(settlementId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE referral_settlements SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findSettlementById(settlementId);
  }

  async listSettlements(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

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

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM referral_settlements ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, settlement_period, status, started_at, completed_at,
              total_referrers, total_rewards, total_amount, currency,
              freeze_ended_at, created_at, updated_at
         FROM referral_settlements
         ${where}
        ORDER BY settlement_period DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { settlements: result.rows, total, limit, offset };
  }

  async createFraudFlag(data) {
    const result = await this.db.query(
      `INSERT INTO referral_fraud_flags (
         referrer_id, referred_user_id, relationship_id, reward_id, flag_type,
         severity, score, description, detected_at, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, NOW())
       RETURNING id, referrer_id, referred_user_id, flag_type, severity, score, created_at`,
      [
        data.referrerId,
        data.referredUserId || null,
        data.relationshipId || null,
        data.rewardId || null,
        data.flagType,
        data.severity || 'MEDIUM',
        data.score ?? null,
        data.description || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listFraudFlags(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.referrerId) {
      conditions.push(`referrer_id = $${index++}`);
      values.push(filters.referrerId);
    }
    if (filters.severity) {
      conditions.push(`severity = $${index++}`);
      values.push(filters.severity);
    }
    if (filters.flagType) {
      conditions.push(`flag_type = $${index++}`);
      values.push(filters.flagType);
    }
    if (filters.since) {
      conditions.push(`detected_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, referrer_id, referred_user_id, relationship_id, reward_id,
              flag_type, severity, score, description, detected_at, resolved_at,
              resolution, created_at
         FROM referral_fraud_flags
         ${where}
        ORDER BY detected_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { flags: result.rows, limit, offset };
  }
}

export default ReferralRepository;