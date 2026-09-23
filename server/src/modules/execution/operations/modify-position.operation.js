/**
 * Modify Position Operation
 *
 * @module signalforge/server/modules/execution/operations/modify-position
 */

import { GatewayFactory } from '../gateway/gateway.factory.js';
import { GATEWAY_TYPES } from '../execution.constants.js';

export class ModifyPositionOperation {
  constructor(gatewayFactory = null) {
    this.gatewayFactory = gatewayFactory || GatewayFactory;
  }

  async execute(trade, modifications, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const result = await gateway.modifyPosition(trade, modifications);
    return {
      operation: 'MODIFY_POSITION',
      gateway: gatewayType,
      modifications,
      result,
    };
  }
}

export default ModifyPositionOperation;