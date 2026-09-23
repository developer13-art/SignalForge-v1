/**
 * OANDA Gateway (stub adapter)
 *
 * @module signalforge/server/modules/execution/gateway/oanda
 */

import { ExecutionGatewayInterface } from './execution-gateway.interface.js';
import { GATEWAY_TYPES } from '../execution.constants.js';
import { GatewayNotConfiguredError } from '../execution.errors.js';

export class OandaGateway extends ExecutionGatewayInterface {
  constructor() {
    super(GATEWAY_TYPES.OANDA);
  }

  async isAvailable() {
    return false;
  }

  assertAvailable() {
    throw new GatewayNotConfiguredError('OANDA gateway is not yet available');
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

export default OandaGateway;