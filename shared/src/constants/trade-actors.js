/**
 * Trade Actors
 *
 * Defines the possible actors that can trigger a trade event or state
 * transition. Every trade event is attributed to exactly one actor type,
 * which provides full auditability across the trade lifecycle.
 *
 * @module @signalforge/shared/constants/trade-actors
 */

export const TRADE_ACTORS = Object.freeze({
  SYSTEM: 'SYSTEM',
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  AUTO_RULE: 'AUTO_RULE',
  BROKER: 'BROKER',
  ADMIN: 'ADMIN',
  RISK_ENGINE: 'RISK_ENGINE',
  COPY_ENGINE: 'COPY_ENGINE',
});

export const TRADE_ACTOR_VALUES = Object.freeze(Object.values(TRADE_ACTORS));

export const TRADE_ACTOR_LABELS = Object.freeze({
  [TRADE_ACTORS.SYSTEM]: 'System',
  [TRADE_ACTORS.USER]: 'User',
  [TRADE_ACTORS.PROVIDER]: 'Provider',
  [TRADE_ACTORS.AUTO_RULE]: 'Automation Rule',
  [TRADE_ACTORS.BROKER]: 'Broker',
  [TRADE_ACTORS.ADMIN]: 'Administrator',
  [TRADE_ACTORS.RISK_ENGINE]: 'Risk Engine',
  [TRADE_ACTORS.COPY_ENGINE]: 'Copy Engine',
});

export function isValidTradeActor(actor) {
  return TRADE_ACTOR_VALUES.includes(actor);
}