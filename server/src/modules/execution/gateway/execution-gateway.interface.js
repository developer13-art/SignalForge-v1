/**
 * Execution Gateway Interface
 *
 * @module signalforge/server/modules/execution/gateway/interface
 */

export class ExecutionGatewayInterface {
  constructor(name) {
    this.name = name;
  }

  async isAvailable() {
    return false;
  }

  async openPosition(request) {
    throw new Error(`${this.name} must implement openPosition()`);
  }

  async closePosition(trade) {
    throw new Error(`${this.name} must implement closePosition()`);
  }

  async modifyPosition(trade, modifications) {
    throw new Error(`${this.name} must implement modifyPosition()`);
  }

  async partialClose(trade, percentage) {
    throw new Error(`${this.name} must implement partialClose()`);
  }

  async placePendingOrder(request) {
    throw new Error(`${this.name} must implement placePendingOrder()`);
  }

  async cancelPendingOrder(request) {
    throw new Error(`${this.name} must implement cancelPendingOrder()`);
  }

  async syncPositions(brokerAccount) {
    throw new Error(`${this.name} must implement syncPositions()`);
  }

  async getAccountInfo(brokerAccount) {
    throw new Error(`${this.name} must implement getAccountInfo()`);
  }
}

export default ExecutionGatewayInterface;