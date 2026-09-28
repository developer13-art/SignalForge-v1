/**
 * Trader Intelligence Module Constants
 *
 * @module signalforge/server/modules/trader-intelligence/constants
 */

export const INTELLIGENCE_EVENTS = Object.freeze({
  ANALYSIS_STARTED: 'trader_intelligence.analysis.started',
  ANALYSIS_COMPLETED: 'trader_intelligence.analysis.completed',
  ANALYSIS_FAILED: 'trader_intelligence.analysis.failed',
  CLASSIFICATION_UPDATED: 'trader_intelligence.classification.updated',
  STYLE_CLASSIFIED: 'trader_intelligence.style.classified',
  RISK_CLASSIFIED: 'trader_intelligence.risk.classified',
  BEHAVIOR_CLASSIFIED: 'trader_intelligence.behavior.classified',
  TIMELINE_UPDATED: 'trader_intelligence.timeline.updated',
  MARTINGALE_DETECTED: 'trader_intelligence.martingale.detected',
  GRID_DETECTED: 'trader_intelligence.grid.detected',
  RECOVERY_TRADING_DETECTED: 'trader_intelligence.recovery.detected',
  NEWS_OVEREXPOSURE_DETECTED: 'trader_intelligence.news.overexposure',
  DISCIPLINE_ALERT: 'trader_intelligence.discipline.alert',
});

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

export const RISK_STYLES = Object.freeze({
  CONSERVATIVE: 'CONSERVATIVE',
  MODERATE: 'MODERATE',
  AGGRESSIVE: 'AGGRESSIVE',
  VERY_AGGRESSIVE: 'VERY_AGGRESSIVE',
  UNCLASSIFIED: 'UNCLASSIFIED',
});

export const RISK_STYLE_VALUES = Object.freeze(Object.values(RISK_STYLES));

export const BEHAVIOR_CATEGORIES = Object.freeze({
  DISCIPLINED: 'DISCIPLINED',
  CONSISTENT: 'CONSISTENT',
  IMPULSIVE: 'IMPULSIVE',
  PATIENT: 'PATIENT',
  AGGRESSIVE: 'AGGRESSIVE',
  CONSERVATIVE: 'CONSERVATIVE',
  RECKLESS: 'RECKLESS',
  ERRATIC: 'ERRATIC',
  UNCLASSIFIED: 'UNCLASSIFIED',
});

export const BEHAVIOR_CATEGORY_VALUES = Object.freeze(
  Object.values(BEHAVIOR_CATEGORIES),
);

export const ANALYSIS_WINDOWS = Object.freeze({
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
  ALL_TIME: 'ALL_TIME',
});

export const ANALYSIS_WINDOW_VALUES = Object.freeze(Object.values(ANALYSIS_WINDOWS));

export const MARTINGALE_THRESHOLDS = Object.freeze({
  minLosingStreak: 2,
  volumeMultiplier: 1.5,
  minTrades: 10,
});

export const GRID_THRESHOLDS = Object.freeze({
  minConcurrentTrades: 3,
  maxSymbolVariety: 3,
  minTrades: 15,
});

export const NEWS_EXPOSURE_THRESHOLDS = Object.freeze({
  minNewsTrades: 5,
  maxNewsRatio: 0.3,
  minTrades: 10,
});

export const RECOVERY_THRESHOLDS = Object.freeze({
  maxMinutesAfterLoss: 15,
  minTrades: 10,
  minRecoveryRatio: 0.5,
});

export const DEFAULT_ANALYSIS_LIMIT = 500;
export const MAX_ANALYSIS_LIMIT = 5000;
export const MIN_TRADES_FOR_CLASSIFICATION = 20;

export function isValidTradingStyle(style) {
  return TRADING_STYLE_VALUES.includes(style);
}

export function isValidRiskStyle(style) {
  return RISK_STYLE_VALUES.includes(style);
}

export function isValidBehaviorCategory(category) {
  return BEHAVIOR_CATEGORY_VALUES.includes(category);
}

export function isValidAnalysisWindow(window) {
  return ANALYSIS_WINDOW_VALUES.includes(window);
}