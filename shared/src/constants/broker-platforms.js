/**
 * Broker Platforms
 *
 * Defines the broker platforms supported by SignalForge. MT4 and MT5
 * are supported via MetaApi. Other platforms are planned for future
 * adapters.
 *
 * @module @signalforge/shared/constants/broker-platforms
 */

export const BROKER_PLATFORMS = Object.freeze({
  MT4: 'MT4',
  MT5: 'MT5',
  CTRADER: 'CTRADER',
  DXTRADE: 'DXTRADE',
  INTERACTIVE_BROKERS: 'INTERACTIVE_BROKERS',
  OANDA: 'OANDA',
});

export const BROKER_PLATFORM_VALUES = Object.freeze(Object.values(BROKER_PLATFORMS));

export const BROKER_PLATFORM_LABELS = Object.freeze({
  [BROKER_PLATFORMS.MT4]: 'MetaTrader 4',
  [BROKER_PLATFORMS.MT5]: 'MetaTrader 5',
  [BROKER_PLATFORMS.CTRADER]: 'cTrader',
  [BROKER_PLATFORMS.DXTRADE]: 'DXTrade',
  [BROKER_PLATFORMS.INTERACTIVE_BROKERS]: 'Interactive Brokers',
  [BROKER_PLATFORMS.OANDA]: 'OANDA',
});

export const METAAPI_SUPPORTED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.MT4,
  BROKER_PLATFORMS.MT5,
]);

export const PLANNED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.CTRADER,
  BROKER_PLATFORMS.DXTRADE,
  BROKER_PLATFORMS.INTERACTIVE_BROKERS,
  BROKER_PLATFORMS.OANDA,
]);

export function isValidBrokerPlatform(platform) {
  return BROKER_PLATFORM_VALUES.includes(platform);
}

export function isMetaApiSupported(platform) {
  return METAAPI_SUPPORTED_PLATFORMS.includes(platform);
}