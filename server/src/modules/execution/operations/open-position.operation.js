/**
 * Open Position Operation
 *
 * @module signalforge/server/modules/execution/operations/open-position
 */

import { GatewayFactory } from '../gateway/gateway.factory.js';
import { GATEWAY_TYPES } from '../execution.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class OpenPositionOperation {
  constructor(gatewayFactory = null) {
    this.gatewayFactory = gatewayFactory || GatewayFactory;
    this.logger = getLogger('open-position-operation');
  }

  async execute(request, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const result = await gateway.openPosition(request);
    return {
      operation: 'OPEN_POSITION',
      gateway: gatewayType,
      result,
    };
  }
}

export default OpenPositionOperation;