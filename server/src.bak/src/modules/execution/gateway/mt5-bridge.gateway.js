/**
 * MT5 Bridge Gateway (stub adapter)
 *
 * This adapter is reserved for a future native MT5 bridge. It exposes
 * the same interface as the MetaApi gateway but is not implemented.
 *
 * @module signalforge/server/modules/execution/gateway/mt5-bridge
 */
const { ExecutionGatewayInterface } = require('./execution-gateway.interface.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
const { GatewayNotConfiguredError } = require('../execution.errors.js');

export class Mt5BridgeGateway extends ExecutionGatewayInterface {
  constructor() {
    super(GATEWAY_TYPES.MT5_BRIDGE);
  }

  async isAvailable() {
    return false;
  }

  assertAvailable() {
    throw new GatewayNotConfiguredError('MT5 Bridge is not yet available');
  }

  async openPosition() {
    this.assertAvailable();
  }

  async closePosition() {
    this.assertAvailable();
  }

  async modifyPosition() {
    this.assertAvailable();
  }

  async partialClose() {
    this.assertAvailable();
  }

  async placePendingOrder() {
    this.assertAvailable();
  }

  async cancelPendingOrder() {
    this.assertAvailable();
  }

  async syncPositions() {
    this.assertAvailable();
  }

  async getAccountInfo() {
    this.assertAvailable();
  }
}
module.exports = Mt5BridgeGateway;