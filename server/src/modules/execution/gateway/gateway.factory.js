/**
 * Gateway Factory
 *
 * @module signalforge/server/modules/execution/gateway/factory
 */
const { MetaApiGateway } = require('./metaapi.gateway.js');
const { Mt5BridgeGateway } = require('./mt5-bridge.gateway.js');
const { CTraderGateway } = require('./ctrader.gateway.js');
const { DXTradeGateway } = require('./dxtrade.gateway.js');
const { InteractiveBrokersGateway } = require('./interactive-brokers.gateway.js');
const { OandaGateway } = require('./oanda.gateway.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
const { GatewayNotConfiguredError } = require('../execution.errors.js');

const registry = new Map([
  [GATEWAY_TYPES.METAAPI, () => new MetaApiGateway()],
  [GATEWAY_TYPES.MT5_BRIDGE, () => new Mt5BridgeGateway()],
  [GATEWAY_TYPES.CTRADER, () => new CTraderGateway()],
  [GATEWAY_TYPES.DXTRADE, () => new DXTradeGateway()],
  [GATEWAY_TYPES.INTERACTIVE_BROKERS, () => new InteractiveBrokersGateway()],
  [GATEWAY_TYPES.OANDA, () => new OandaGateway()],
]);
class GatewayFactory {
  static register(gatewayType, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Gateway factory must be a function');
    }
    registry.set(gatewayType, factory);
  }

  static create(gatewayType = GATEWAY_TYPES.METAAPI) {
    const factory = registry.get(gatewayType);
    if (!factory) {
      throw new GatewayNotConfiguredError(`Gateway "${gatewayType}" is not registered`);
    }
    return factory();
  }

  static list() {
    return Array.from(registry.keys());
  }

  static createAvailable(gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.create(gatewayType);
    return gateway;
  }
}
module.exports = GatewayFactory;
module.exports.GatewayFactory = GatewayFactory;
