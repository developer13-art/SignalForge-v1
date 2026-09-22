/**
 * Trading Styles
 *
 * Defines the trading style classifications produced by the AI Trader
 * Intelligence engine.
 *
 * @module @signalforge/shared/constants/trading-styles
 */

export const TRADING_STYLES = Object.freeze({
  SCALPER: 'SCALPER',
  DAY_TRADER: 'DAY_TRADER',
  SWING_TRADER: 'SWING_TRADER',
  POSITION_TRADER: 'POSITION_TRADER',
  NEWS_TRADER: 'NEWS_TRADER',
  TREND_FOLLOWER: 'TREND_FOLLOWER',
  RANGE_TRADER: 'RANGE_TRADER',
  BREAKOUT_TRADER: 'BREAKOUT_TRADER',
  MEAN_REVERSION: 'MEAN_REVERSION',
  MARTINGALE: 'MARTINGALE',
  GRID_TRADER: 'GRID_TRADER',
  ALGORITHMIC: 'ALGORITHMIC',
  MIXED: 'MIXED',
  UNCLASSIFIED: 'UNCLASSIFIED',
});

export const TRADING_STYLE_VALUES = Object.freeze(Object.values(TRADING_STYLES));

export const TRADING_STYLE_LABELS = Object.freeze({
  [TRADING_STYLES.SCALPER]: 'Scalper',
  [TRADING_STYLES.DAY_TRADER]: 'Day Trader',
  [TRADING_STYLES.SWING_TRADER]: 'Swing Trader',
  [TRADING_STYLES.POSITION_TRADER]: 'Position Trader',
  [TRADING_STYLES.NEWS_TRADER]: 'News Trader',
  [TRADING_STYLES.TREND_FOLLOWER]: 'Trend Follower',
  [TRADING_STYLES.RANGE_TRADER]: 'Range Trader',
  [TRADING_STYLES.BREAKOUT_TRADER]: 'Breakout Trader',
  [TRADING_STYLES.MEAN_REVERSION]: 'Mean Reversion Trader',
  [TRADING_STYLES.MARTINGALE]: 'Martingale Trader',
  [TRADING_STYLES.GRID_TRADER]: 'Grid Trader',
  [TRADING_STYLES.ALGORITHMIC]: 'Algorithmic Trader',
  [TRADING_STYLES.MIXED]: 'Mixed Style',
  [TRADING_STYLES.UNCLASSIFIED]: 'Unclassified',
});

export const RISK_STYLE_CLASSIFICATIONS = Object.freeze({
  CONSERVATIVE: 'CONSERVATIVE',
  MODERATE: 'MODERATE',
  AGGRESSIVE: 'AGGRESSIVE',
  VERY_AGGRESSIVE: 'VERY_AGGRESSIVE',
  UNCLASSIFIED: 'UNCLASSIFIED',
});

export const RISK_STYLE_CLASSIFICATION_VALUES = Object.freeze(
  Object.values(RISK_STYLE_CLASSIFICATIONS),
);

export const RISK_STYLE_CLASSIFICATION_LABELS = Object.freeze({
  [RISK_STYLE_CLASSIFICATIONS.CONSERVATIVE]: 'Conservative',
  [RISK_STYLE_CLASSIFICATIONS.MODERATE]: 'Moderate',
  [RISK_STYLE_CLASSIFICATIONS.AGGRESSIVE]: 'Aggressive',
  [RISK_STYLE_CLASSIFICATIONS.VERY_AGGRESSIVE]: 'Very Aggressive',
  [RISK_STYLE_CLASSIFICATIONS.UNCLASSIFIED]: 'Unclassified',
});

export function isValidTradingStyle(style) {
  return TRADING_STYLE_VALUES.includes(style);
}

export function isValidRiskStyleClassification(classification) {
  return RISK_STYLE_CLASSIFICATION_VALUES.includes(classification);
}