/**
 * Voting Service
 *
 * @module signalforge/server/modules/consensus/voting
 */

import {
  CONSENSUS_DIRECTIONS,
  VOTING_STRATEGIES,
  DEFAULT_SUPER_MAJORITY_THRESHOLD,
  DEFAULT_MINIMUM_AGREEMENT,
} from './consensus.constants.js';
import { VotingStrategyError } from './consensus.errors.js';

export class VotingService {
  tally(members, strategy = VOTING_STRATEGIES.WEIGHTED_BY_CONFIDENCE) {
    if (!Array.isArray(members) || members.length === 0) {
      return {
        direction: CONSENSUS_DIRECTIONS.NO_CONSENSUS,
        buyWeight: 0,
        sellWeight: 0,
        totalWeight: 0,
        agreement: 0,
        strategy,
      };
    }

    switch (strategy) {
      case VOTING_STRATEGIES.SIMPLE_MAJORITY:
        return this.simpleMajority(members);
      case VOTING_STRATEGIES.WEIGHTED_BY_CONFIDENCE:
        return this.weightedByConfidence(members);
      case VOTING_STRATEGIES.WEIGHTED_BY_REPUTATION:
        return this.weightedByReputation(members);
      case VOTING_STRATEGIES.SUPER_MAJORITY:
        return this.superMajority(members);
      case VOTING_STRATEGIES.UNANIMOUS:
        return this.unanimous(members);
      default:
        throw new VotingStrategyError(undefined, { strategy });
    }
  }

  simpleMajority(members) {
    let buyCount = 0;
    let sellCount = 0;
    for (const member of members) {
      if (member.direction === CONSENSUS_DIRECTIONS.BUY) {
        buyCount++;
      } else if (member.direction === CONSENSUS_DIRECTIONS.SELL) {
        sellCount++;
      }
    }
    const total = buyCount + sellCount;
    return this.buildResult(
      buyCount,
      sellCount,
      buyCount,
      sellCount,
      total,
      VOTING_STRATEGIES.SIMPLE_MAJORITY,
    );
  }

  weightedByConfidence(members) {
    let buyWeight = 0;
    let sellWeight = 0;
    for (const member of members) {
      const weight = Number(member.confidence ?? member.weight ?? 1);
      if (member.direction === CONSENSUS_DIRECTIONS.BUY) {
        buyWeight += weight;
      } else if (member.direction === CONSENSUS_DIRECTIONS.SELL) {
        sellWeight += weight;
      }
    }
    const total = buyWeight + sellWeight;
    return this.buildResult(
      buyWeight,
      sellWeight,
      buyWeight,
      sellWeight,
      total,
      VOTING_STRATEGIES.WEIGHTED_BY_CONFIDENCE,
    );
  }

  weightedByReputation(members) {
    let buyWeight = 0;
    let sellWeight = 0;
    for (const member of members) {
      const weight = Number(member.reputation ?? member.weight ?? 1);
      if (member.direction === CONSENSUS_DIRECTIONS.BUY) {
        buyWeight += weight;
      } else if (member.direction === CONSENSUS_DIRECTIONS.SELL) {
        sellWeight += weight;
      }
    }
    const total = buyWeight + sellWeight;
    return this.buildResult(
      buyWeight,
      sellWeight,
      buyWeight,
      sellWeight,
      total,
      VOTING_STRATEGIES.WEIGHTED_BY_REPUTATION,
    );
  }

  superMajority(members) {
    const base = this.simpleMajority(members);
    const threshold = DEFAULT_SUPER_MAJORITY_THRESHOLD;
    if (base.agreement >= threshold) {
      return { ...base, strategy: VOTING_STRATEGIES.SUPER_MAJORITY };
    }
    return {
      ...base,
      direction: CONSENSUS_DIRECTIONS.NO_CONSENSUS,
      strategy: VOTING_STRATEGIES.SUPER_MAJORITY,
    };
  }

  unanimous(members) {
    const directions = new Set(members.map((m) => m.direction));
    if (directions.size === 1) {
      const only = members[0].direction;
      return {
        direction: only,
        buyWeight: only === CONSENSUS_DIRECTIONS.BUY ? members.length : 0,
        sellWeight: only === CONSENSUS_DIRECTIONS.SELL ? members.length : 0,
        totalWeight: members.length,
        agreement: 1,
        strategy: VOTING_STRATEGIES.UNANIMOUS,
      };
    }
    return {
      direction: CONSENSUS_DIRECTIONS.NO_CONSENSUS,
      buyWeight: 0,
      sellWeight: 0,
      totalWeight: members.length,
      agreement: 0,
      strategy: VOTING_STRATEGIES.UNANIMOUS,
    };
  }

  buildResult(buyWeight, sellWeight, buyCount, sellCount, total, strategy) {
    if (total === 0) {
      return {
        direction: CONSENSUS_DIRECTIONS.NO_CONSENSUS,
        buyWeight: 0,
        sellWeight: 0,
        totalWeight: 0,
        agreement: 0,
        strategy,
      };
    }

    let direction = CONSENSUS_DIRECTIONS.NO_CONSENSUS;
    let agreement = 0;

    if (buyWeight > sellWeight) {
      direction = CONSENSUS_DIRECTIONS.BUY;
      agreement = buyWeight / total;
    } else if (sellWeight > buyWeight) {
      direction = CONSENSUS_DIRECTIONS.SELL;
      agreement = sellWeight / total;
    } else {
      direction = CONSENSUS_DIRECTIONS.NO_CONSENSUS;
      agreement = 0.5;
    }

    if (agreement < DEFAULT_MINIMUM_AGREEMENT && direction !== CONSENSUS_DIRECTIONS.NO_CONSENSUS) {
      direction = CONSENSUS_DIRECTIONS.NO_CONSENSUS;
    }

    return {
      direction,
      buyWeight: Number(buyWeight.toFixed(4)),
      sellWeight: Number(sellWeight.toFixed(4)),
      buyCount,
      sellCount,
      totalWeight: Number(total.toFixed(4)),
      agreement: Number(agreement.toFixed(4)),
      strategy,
    };
  }
}

export default VotingService;