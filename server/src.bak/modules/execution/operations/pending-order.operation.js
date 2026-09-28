/**
 * Pending Order Operation
 *
 * @module signalforge/server/modules/execution/operations/pending-order
 */

import { GatewayFactory } from '../gateway/gateway.factory.js';
import { GATEWAY_TYPES } from '../execution.constants.js';

export class PendingOrderOperation {
  constructor(gatewayFactory = null) {
    this.gatewayFactory = gatewayFactory || GatewayFactory;
  }

  async place(request, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const result = await gateway.placePendingOrder(request);
    return {
      operation: 'PENDING_ORDER',
      gateway: gatewayType,
      result,
    };
  }

  async cancel(request, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const result = await gateway.cancelPendingOrder(request);
    return {
      operation: 'CANCEL_PENDING',
      gateway: gatewayType,
      result,
    };
  }
}

export default PendingOrderOperation;