/**
 * Partial Close Operation
 *
 * @module signalforge/server/modules/execution/operations/partial-close
 */
const { GatewayFactory } = require('../gateway/gateway.factory.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
class PartialCloseOperation {
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
module.exports = PartialCloseOperation;
module.exports.PartialCloseOperation = PartialCloseOperation;
