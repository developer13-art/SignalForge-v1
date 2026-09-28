/**
 * Sync Positions Operation
 *
 * @module signalforge/server/modules/execution/operations/sync-positions
 */
const { GatewayFactory } = require('../gateway/gateway.factory.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
class SyncPositionsOperation {
  constructor(gatewayFactory = null) {
    this.gatewayFactory = gatewayFactory || GatewayFactory;
  }

  async execute(brokerAccount, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const positions = await gateway.syncPositions(brokerAccount);
    return {
      operation: 'SYNC_POSITIONS',
      gateway: gatewayType,
      positions,
      count: positions.length,
    };
  }

  async getAccountInfo(brokerAccount, gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = this.gatewayFactory.create(gatewayType);
    const info = await gateway.getAccountInfo(brokerAccount);
    return {
      operation: 'GET_ACCOUNT_INFO',
      gateway: gatewayType,
      info,
    };
  }
}
module.exports = SyncPositionsOperation;
module.exports.SyncPositionsOperation = SyncPositionsOperation;
