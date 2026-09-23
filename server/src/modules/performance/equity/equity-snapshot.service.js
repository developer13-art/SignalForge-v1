/**
 * Equity Snapshot Service
 *
 * @module signalforge/server/modules/performance/equity/service
 */

import { EquitySnapshotRepository } from './repository.js';
import { emitEquitySnapshotCaptured } from '../performance.events.js';

export class EquitySnapshotService {
  constructor(repository = null) {
    this.repository = repository || new EquitySnapshotRepository();
  }

  async capture(data) {
    const created = await this.repository.create({
      userId: data.userId,
      brokerAccountId: data.brokerAccountId || null,
      periodId: data.periodId || null,
      balance: data.balance ?? null,
      equity: data.equity ?? null,
      drawdown: data.drawdown ?? null,
      drawdownPercent: data.drawdownPercent ?? null,
      capturedAt: data.capturedAt || new Date(),
      source: data.source || 'SYSTEM',
      metadata: data.metadata || null,
    });

    await emitEquitySnapshotCaptured(data.userId, created.id, {
      brokerAccountId: data.brokerAccountId || null,
    });

    return created;
  }

  async captureForAccount(account) {
    if (!account) {
      return null;
    }
    const balance = Number(account.balance || 0);
    const equity = Number(account.equity || 0);
    const drawdown = Math.max(0, balance - equity);
    const drawdownPercent = balance > 0 ? (drawdown / balance) * 100 : 0;

    return this.capture({
      userId: account.user_id,
      brokerAccountId: account.id,
      balance,
      equity,
      drawdown,
      drawdownPercent: Number(drawdownPercent.toFixed(4)),
      source: 'ACCOUNT_SYNC',
    });
  }

  async list(userId, filters, pagination) {
    const result = await this.repository.list(userId, filters, pagination);
    return {
      snapshots: result.snapshots.map((s) => this.serialize(s)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getLatest(userId, brokerAccountId) {
    const row = await this.repository.findLatest(userId, brokerAccountId);
    return this.serialize(row);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      periodId: row.period_id,
      balance: row.balance,
      equity: row.equity,
      drawdown: row.drawdown,
      drawdownPercent: row.drawdown_percent,
      capturedAt: row.captured_at,
      source: row.source,
    };
  }
}

export default EquitySnapshotService;