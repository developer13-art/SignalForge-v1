/**
 * Close Position Operation
 *
 * @module signalforge/server/modules/execution/operations/close-position
 */
const { GatewayFactory } = require('../gateway/gateway.factory.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
class ClosePositionOperation {
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
module.exports = ClosePositionOperation;
module.exports.ClosePositionOperation = ClosePositionOperation;
