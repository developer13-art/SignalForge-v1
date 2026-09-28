/**
 * Comparison Service
 *
 * @module signalforge/server/modules/trade-shadow/comparison
 */

import { DIVERGENCE_TYPES, SHADOW_OUTCOMES } from './shadow.constants.js';
import { TradeStateRepository } from '../trade-state/trade-state.repository.js';

const DEFAULT_THRESHOLD_PIPS = 5;

function toNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export class ComparisonService {
  constructor(repository = null) {
    this.repository = repository || new TradeStateRepository();
  }

  compare(providerTrade, userTrade, options = {}) {
    if (!providerTrade || !userTrade) {
      return {
        outcome: SHADOW_OUTCOMES.INCONCLUSIVE,
        reason: 'MISSING_TRADES',
        divergence: null,
      };
    }

    const thresholdPips = options.thresholdPips || DEFAULT_THRESHOLD_PIPS;

    const providerProfit = toNumber(providerTrade.realized_profit) || 0;
    const userProfit = toNumber(userTrade.realized_profit) || 0;
    const difference = Number((userProfit - providerProfit).toFixed(2));
    const missedProfit = Number((providerProfit - userProfit).toFixed(2));

    const divergences = this.detectDivergences(providerTrade, userTrade, thresholdPips);

    let outcome = SHADOW_OUTCOMES.EQUAL;
    if (Math.abs(difference) < 0.01) {
      outcome = SHADOW_OUTCOMES.EQUAL;
    } else if (difference > 0) {
      outcome = SHADOW_OUTCOMES.USER_BETTER;
    } else {
      outcome = SHADOW_OUTCOMES.PROVIDER_BETTER;
    }

    return {
      outcome,
      providerProfit,
      userProfit,
      difference,
      missedProfit,
      divergences,
      divergenceType: divergences.length > 0 ? divergences[0].type : null,
    };
  }

  detectDivergences(providerTrade, userTrade, thresholdPips) {
    const divergences = [];

    const providerExit = toNumber(providerTrade.exit_price);
    const userExit = toNumber(userTrade.exit_price);
    if (providerExit !== null && userExit !== null && providerExit !== userExit) {
      const diffPips = Math.abs(providerExit - userExit);
      if (diffPips >= thresholdPips) {
        divergences.push({
          type: DIVERGENCE_TYPES.DIFFERENT_PRICE,
          providerValue: providerExit,
          userValue: userExit,
          difference: diffPips,
        });
      }
    }

    const providerClosedAt = providerTrade.closed_at ? new Date(providerTrade.closed_at).getTime() : null;
    const userClosedAt = userTrade.closed_at ? new Date(userTrade.closed_at).getTime() : null;
    if (providerClosedAt && userClosedAt) {
      const diffMs = userClosedAt - providerClosedAt;
      if (diffMs < -60000) {
        divergences.push({
          type: DIVERGENCE_TYPES.EARLY_EXIT,
          providerValue: providerTrade.closed_at,
          userValue: userTrade.closed_at,
          differenceMs: Math.abs(diffMs),
        });
      } else if (diffMs > 60000) {
        divergences.push({
          type: DIVERGENCE_TYPES.LATE_EXIT,
          providerValue: providerTrade.closed_at,
          userValue: userTrade.closed_at,
          differenceMs: diffMs,
        });
      }
    }

    const providerVolume = toNumber(providerTrade.volume);
    const userVolume = toNumber(userTrade.volume);
    if (providerVolume !== null && userVolume !== null && providerVolume !== userVolume) {
      divergences.push({
        type: DIVERGENCE_TYPES.PARTIAL_CLOSE_DIFF,
        providerValue: providerVolume,
        userValue: userVolume,
        difference: Math.abs(providerVolume - userVolume),
      });
    }

    return divergences;
  }
}

export default ComparisonService;