/**
 * Provider Consensus Service
 *
 * @module signalforge/server/modules/marketplace/comparison/provider-consensus
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class ProviderConsensusService {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async computeConsensus(providerIds, windowHours = 24) {
    if (!Array.isArray(providerIds) || providerIds.length < 2) {
      return {
        consensus: false,
        reason: 'INSUFFICIENT_PROVIDERS',
        members: [],
      };
    }

    const result = await this.db.query(
      `SELECT s.provider_id, s.normalized_symbol AS symbol, s.direction,
              COUNT(*)::int AS count
         FROM signals s
        WHERE s.provider_id = ANY($1::uuid[])
          AND s.created_at >= NOW() - ($2::int * interval '1 hour')
          AND s.status IN ('VALIDATED', 'RISK_APPROVED', 'EXECUTED')
        GROUP BY s.provider_id, s.normalized_symbol, s.direction`,
      [providerIds, windowHours],
    );

    const symbolBuckets = new Map();
    for (const row of result.rows) {
      const key = `${row.symbol}:${row.direction}`;
      if (!symbolBuckets.has(key)) {
        symbolBuckets.set(key, {
          symbol: row.symbol,
          direction: row.direction,
          providers: [],
        });
      }
      symbolBuckets.get(key).providers.push(row.provider_id);
    }

    const members = Array.from(symbolBuckets.values()).map((bucket) => ({
      symbol: bucket.symbol,
      direction: bucket.direction,
      providerCount: bucket.providers.length,
      providers: bucket.providers,
      agrees: bucket.providers.length >= 2,
    }));

    return {
      consensus: members.some((m) => m.agrees),
      members,
      windowHours,
    };
  }
}

export default ProviderConsensusService;