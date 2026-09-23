/**
 * Sync Positions Operation
 *
 * @module signalforge/server/modules/execution/operations/sync-positions
 */

import { GatewayFactory } from '../gateway/gateway.factory.js';
import { GATEWAY_TYPES } from '../execution.constants.js';

export class SyncPositionsOperation {
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

export default SyncPositionsOperation;