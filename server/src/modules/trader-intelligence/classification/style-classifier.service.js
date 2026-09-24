/**
 * Trading Style Classifier Service
 *
 * @module signalforge/server/modules/trader-intelligence/classification/style-classifier
 */

import {
  TRADING_STYLES,
  MIN_TRADES_FOR_CLASSIFICATION,
} from '../intelligence.constants.js';

export class StyleClassifierService {
  classify({ trades, holdingTime, martingale, grid }) {
    if (!Array.isArray(trades) || trades.length < MIN_TRADES_FOR_CLASSIFICATION) {
      return {
        style: TRADING_STYLES.UNCLASSIFIED,
        confidence: 0,
        reason: 'INSUFFICIENT_SAMPLES',
      };
    }

    if (martingale && martingale.detected) {
      return {
        style: TRADING_STYLES.MARTINGALE,
        confidence: Number(Math.min(1, martingale.score).toFixed(4)),
      };
    }

    if (grid && grid.detected) {
      return {
        style: TRADING_STYLES.GRID_TRADER,
        confidence: Number(Math.min(1, grid.score).toFixed(4)),
      };
    }

    const avgMinutes = holdingTime?.averageMinutes || 0;
    const avgRr = this.calculateAverageRr(trades);

    if (avgMinutes > 0 && avgMinutes < 15 && avgRr >= 1) {
      return {
        style: TRADING_STYLES.SCALPER,
        confidence: 0.8,
      };
    }

    if (avgMinutes > 0 && avgMinutes < 24 * 60) {
      return {
        style: TRADING_STYLES.DAY_TRADER,
        confidence: 0.75,
      };
    }

    if (avgMinutes >= 24 * 60 && avgMinutes < 7 * 24 * 60) {
      return {
        style: TRADING_STYLES.SWING_TRADER,
        confidence: 0.75,
      };
    }

    if (avgMinutes >= 7 * 24 * 60) {
      return {
        style: TRADING_STYLES.POSITION_TRADER,
        confidence: 0.75,
      };
    }

    return {
      style: TRADING_STYLES.MIXED,
      confidence: 0.5,
    };
  }

  calculateAverageRr(trades) {
    let totalRr = 0;
    let samples = 0;
    for (const trade of trades) {
      const entry = Number(trade.entry_price || 0);
      const stopLoss = Number(trade.stop_loss || 0);
      const exit = Number(trade.exit_price || 0);
      if (!entry || !stopLoss || !exit) {
        continue;
      }
      const risk = Math.abs(entry - stopLoss);
      const reward = Math.abs(exit - entry);
      if (risk <= 0) {
        continue;
      }
      totalRr += reward / risk;
      samples++;
    }
    return samples > 0 ? totalRr / samples : 0;
  }
}

export default StyleClassifierService;