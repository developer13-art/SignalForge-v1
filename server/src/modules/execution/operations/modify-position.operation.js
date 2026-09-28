/**
 * Modify Position Operation
 *
 * @module signalforge/server/modules/execution/operations/modify-position
 */
const { GatewayFactory } = require('../gateway/gateway.factory.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
class ModifyPositionOperation {
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
module.exports = ModifyPositionOperation;
module.exports.ModifyPositionOperation = ModifyPositionOperation;
