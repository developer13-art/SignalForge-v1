/**
 * Conflict Resolver Service
 *
 * @module signalforge/server/modules/consensus/conflict-resolver
 */

import { CONSENSUS_DIRECTIONS } from './consensus.constants.js';

export class ConflictResolverService {
  detect(members) {
    if (!Array.isArray(members) || members.length < 2) {
      return { conflicting: false };
    }

    const buy = members.filter((m) => m.direction === CONSENSUS_DIRECTIONS.BUY);
    const sell = members.filter((m) => m.direction === CONSENSUS_DIRECTIONS.SELL);

    if (buy.length === 0 || sell.length === 0) {
      return { conflicting: false };
    }

    const buyWeight = buy.reduce((acc, m) => acc + Number(m.confidence ?? m.weight ?? 1), 0);
    const sellWeight = sell.reduce((acc, m) => acc + Number(m.confidence ?? m.weight ?? 1), 0);

    return {
      conflicting: true,
      buy: {
        count: buy.length,
        weight: Number(buyWeight.toFixed(4)),
        providers: buy.map((m) => m.providerId || m.provider_id),
      },
      sell: {
        count: sell.length,
        weight: Number(sellWeight.toFixed(4)),
        providers: sell.map((m) => m.providerId || m.provider_id),
      },
    };
  }

  resolve(members, options = {}) {
    const conflict = this.detect(members);
    if (!conflict.conflicting) {
      return {
        resolved: false,
        reason: 'NO_CONFLICT',
      };
    }

    if (conflict.buy.weight > conflict.sell.weight) {
      return {
        resolved: true,
        direction: CONSENSUS_DIRECTIONS.BUY,
        strength: conflict.buy.weight - conflict.sell.weight,
        conflict,
      };
    }

    if (conflict.sell.weight > conflict.buy.weight) {
      return {
        resolved: true,
        direction: CONSENSUS_DIRECTIONS.SELL,
        strength: conflict.sell.weight - conflict.buy.weight,
        conflict,
      };
    }

    return {
      resolved: false,
      reason: 'TIE',
      conflict,
    };
  }
}

export default ConflictResolverService;