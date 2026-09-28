/**
 * Open Position Operation
 *
 * @module signalforge/server/modules/execution/operations/open-position
 */
const { GatewayFactory } = require('../gateway/gateway.factory.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');

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
module.exports = OpenPositionOperation;