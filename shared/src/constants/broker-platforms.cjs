/**
 * Broker Platforms
 *
 * Defines the broker platforms supported by SignalForge. MT4 and MT5
 * are supported via MetaApi. Other platforms are planned for future
 * adapters.
 *
 * @module @signalforge/shared/constants/broker-platforms
 */const BROKER_PLATFORMS = Object.freeze({
  MT4: 'MT4',
  MT5: 'MT5',
  CTRADER: 'CTRADER',
  DXTRADE: 'DXTRADE',
  INTERACTIVE_BROKERS: 'INTERACTIVE_BROKERS',
  OANDA: 'OANDA',
});const BROKER_PLATFORM_VALUES = Object.freeze(Object.values(BROKER_PLATFORMS));const BROKER_PLATFORM_LABELS = Object.freeze({
  [BROKER_PLATFORMS.MT4]: 'MetaTrader 4',
  [BROKER_PLATFORMS.MT5]: 'MetaTrader 5',
  [BROKER_PLATFORMS.CTRADER]: 'cTrader',
  [BROKER_PLATFORMS.DXTRADE]: 'DXTrade',
  [BROKER_PLATFORMS.INTERACTIVE_BROKERS]: 'Interactive Brokers',
  [BROKER_PLATFORMS.OANDA]: 'OANDA',
});const METAAPI_SUPPORTED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.MT4,
  BROKER_PLATFORMS.MT5,
]);const PLANNED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.CTRADER,
  BROKER_PLATFORMS.DXTRADE,
  BROKER_PLATFORMS.INTERACTIVE_BROKERS,
  BROKER_PLATFORMS.OANDA,
]);function isValidBrokerPlatform(platform) {
  return BROKER_PLATFORM_VALUES.includes(platform);
}function isMetaApiSupported(platform) {
  return METAAPI_SUPPORTED_PLATFORMS.includes(platform);
}

module.exports.isValidBrokerPlatform = isValidBrokerPlatform;
module.exports.isMetaApiSupported = isMetaApiSupported;
module.exports.BROKER_PLATFORMS = BROKER_PLATFORMS;
module.exports.BROKER_PLATFORM_VALUES = BROKER_PLATFORM_VALUES;
module.exports.BROKER_PLATFORM_LABELS = BROKER_PLATFORM_LABELS;
module.exports.METAAPI_SUPPORTED_PLATFORMS = METAAPI_SUPPORTED_PLATFORMS;
module.exports.PLANNED_PLATFORMS = PLANNED_PLATFORMS;
