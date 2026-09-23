/**
 * Close Position Operation
 *
 * @module signalforge/server/modules/execution/operations/close-position
 */

import { GatewayFactory } from '../gateway/gateway.factory.js';
import { GATEWAY_TYPES } from '../execution.constants.js';

export class ClosePositionOperation {
  constructor(gatewayFactory = null) {
    this.gatewayFactory = gatewayFactory || GatewayFactory;
  }

  async execute(trade, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const result = await gateway.closePosition(trade);
    return {
      operation: 'CLOSE_POSITION',
      gateway: gatewayType,
      result,
    };
  }
}

export default ClosePositionOperation;