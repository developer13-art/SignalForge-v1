/**
 * Strategy Service
 *
 * @module signalforge/server/modules/consensus/strategy
 */

import {
  VOTING_STRATEGIES,
  CONSENSUS_DIRECTIONS,
} from './consensus.constants.js';

export class StrategyService {
  shouldTrade(result, strategyConfig = {}) {
    if (!result || result.direction === CONSENSUS_DIRECTIONS.NO_CONSENSUS) {
      return { shouldTrade: false, reason: 'NO_CONSENSUS_DIRECTION' };
    }

    const minAgreement = strategyConfig.minAgreement ?? 0.6;
    if (result.agreement < minAgreement) {
      return { shouldTrade: false, reason: 'AGREEMENT_BELOW_THRESHOLD' };
    }

    const minConfidence = strategyConfig.minConfidence ?? 0.5;
    if ((result.confidenceScore ?? 0) < minConfidence) {
      return { shouldTrade: false, reason: 'CONFIDENCE_BELOW_THRESHOLD' };
    }

    return { shouldTrade: true, direction: result.direction };
  }

  defaultConfig() {
    return {
      votingStrategy: VOTING_STRATEGIES.WEIGHTED_BY_CONFIDENCE,
      minAgreement: 0.6,
      minConfidence: 0.5,
      requiredParticipants: 2,
    };
  }
}

export default StrategyService;