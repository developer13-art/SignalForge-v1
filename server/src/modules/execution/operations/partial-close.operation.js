/**
 * Partial Close Operation
 *
 * @module signalforge/server/modules/execution/operations/partial-close
 */

import { GatewayFactory } from '../gateway/gateway.factory.js';
import { GATEWAY_TYPES } from '../execution.constants.js';

export class PartialCloseOperation {
  constructor(gatewayFactory = null) {
    this.gatewayFactory = gatewayFactory || GatewayFactory;
  }

  async execute(trade, percentage, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const result = await gateway.partialClose(trade, percentage);
    return {
      operation: 'PARTIAL_CLOSE',
      gateway: gatewayType,
      percentage,
      result,
    };
  }
}

export default PartialCloseOperation;