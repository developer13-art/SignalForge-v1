/**
 * DXTrade Gateway (stub adapter)
 *
 * @module signalforge/server/modules/execution/gateway/dxtrade
 */
const { ExecutionGatewayInterface } = require('./execution-gateway.interface.js');
const { GATEWAY_TYPES } = require('../execution.constants.js');
const { GatewayNotConfiguredError } = require('../execution.errors.js');

export class DXTradeGateway extends ExecutionGatewayInterface {
  constructor() {
    super(GATEWAY_TYPES.DXTRADE);
  }

  async isAvailable() {
    return false;
  }

  assertAvailable() {
    throw new GatewayNotConfiguredError('DXTrade gateway is not yet available');
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
module.exports = DXTradeGateway;