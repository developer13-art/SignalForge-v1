/**
 * Gateway Factory
 *
 * @module signalforge/server/modules/execution/gateway/factory
 */

import { MetaApiGateway } from './metaapi.gateway.js';
import { Mt5BridgeGateway } from './mt5-bridge.gateway.js';
import { CTraderGateway } from './ctrader.gateway.js';
import { DXTradeGateway } from './dxtrade.gateway.js';
import { InteractiveBrokersGateway } from './interactive-brokers.gateway.js';
import { OandaGateway } from './oanda.gateway.js';
import { GATEWAY_TYPES } from '../execution.constants.js';
import { GatewayNotConfiguredError } from '../execution.errors.js';

const registry = new Map([
  [GATEWAY_TYPES.METAAPI, () => new MetaApiGateway()],
  [GATEWAY_TYPES.MT5_BRIDGE, () => new Mt5BridgeGateway()],
  [GATEWAY_TYPES.CTRADER, () => new CTraderGateway()],
  [GATEWAY_TYPES.DXTRADE, () => new DXTradeGateway()],
  [GATEWAY_TYPES.INTERACTIVE_BROKERS, () => new InteractiveBrokersGateway()],
  [GATEWAY_TYPES.OANDA, () => new OandaGateway()],
]);

export class GatewayFactory {
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

export default GatewayFactory;