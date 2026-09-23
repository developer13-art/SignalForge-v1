/**
 * MetaApi Gateway
 *
 * @module signalforge/server/modules/execution/gateway/metaapi
 */

import { ExecutionGatewayInterface } from './execution-gateway.interface.js';
import { GATEWAY_TYPES } from '../execution.constants.js';
import {
  GatewayError,
  GatewayTimeoutError,
  GatewayRateLimitedError,
  BrokerRejectedError,
} from '../execution.errors.js';
import metaApiConfig from '../../../config/metaapi.config.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class MetaApiGateway extends ExecutionGatewayInterface {
  constructor(config = null) {
    super(GATEWAY_TYPES.METAAPI);
    this.config = config || metaApiConfig;
    this.logger = getLogger('metaapi-gateway');
  }

  async isAvailable() {
    return Boolean(this.config.enabled && this.config.token);
  }

  buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'auth-token': this.config.token,
    };
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), this.config.requestTimeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new GatewayTimeoutError('MetaApi request timed out');
      }
      throw new GatewayError('MetaApi request failed', {
        errorType: 'NETWORK',
        cause: error.message,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async handleResponse(response) {
    if (response.status === 429) {
      throw new GatewayRateLimitedError('MetaApi rate limit exceeded');
    }
    if (response.status === 401) {
      throw new GatewayError('MetaApi authentication failed', {
        errorType: 'UNAUTHORIZED',
        status: response.status,
      });
    }
    if (!response.ok) {
      const text = await response.text();
      throw new GatewayError(`MetaApi responded with status ${response.status}`, {
        errorType: 'BROKER_REJECTED',
        status: response.status,
        body: text,
      });
    }
    return response.json();
  }

  async openPosition(request) {
    if (!request.metaApiAccountId) {
      throw new GatewayError('MetaApi account id is required', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${request.metaApiAccountId}/trade`;

    const body = {
      symbol: request.symbol,
      volume: request.volume,
      actionType: request.direction === 'BUY' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
      comment: request.comment || 'SignalForge',
      options: {
        magic: request.magicNumber || null,
      },
    };

    if (request.entryType === 'MARKET') {
      if (request.stopLoss) {
        body.stopLoss = request.stopLoss;
      }
      if (request.takeProfit) {
        body.takeProfit = request.takeProfit;
      }
    } else {
      body.openPrice = request.price;
      if (request.entryType === 'LIMIT') {
        body.actionType =
          request.direction === 'BUY' ? 'ORDER_TYPE_BUY_LIMIT' : 'ORDER_TYPE_SELL_LIMIT';
      } else if (request.entryType === 'STOP') {
        body.actionType =
          request.direction === 'BUY' ? 'ORDER_TYPE_BUY_STOP' : 'ORDER_TYPE_SELL_STOP';
      }
      if (request.stopLoss) {
        body.stopLoss = request.stopLoss;
      }
      if (request.takeProfit) {
        body.takeProfit = request.takeProfit;
      }
    }

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    const data = await this.handleResponse(response);

    if (data.stringCode && data.stringCode !== 'TRADE_RETCODE_DONE') {
      throw new BrokerRejectedError(data.message || 'MetaApi rejected the order', {
        stringCode: data.stringCode,
        numericCode: data.numericCode,
      });
    }

    return {
      brokerOrderId: data.orderId || null,
      brokerPositionId: data.positionId || null,
      brokerTicket: data.orderId || data.positionId || null,
      executedPrice: data.price || request.price || null,
      executedVolume: data.volume || request.volume,
      raw: data,
    };
  }

  async closePosition(trade) {
    const positionId = trade.broker_position_id || trade.broker_ticket;
    if (!positionId) {
      throw new GatewayError('Position id is required to close a trade', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${trade.metaapi_account_id}/trade`;

    const body = {
      actionType: 'POSITION_CLOSE_ID',
      positionId,
    };

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    const data = await this.handleResponse(response);

    return {
      closed: true,
      exitPrice: data.price || null,
      raw: data,
    };
  }

  async modifyPosition(trade, modifications) {
    const positionId = trade.broker_position_id || trade.broker_ticket;
    if (!positionId) {
      throw new GatewayError('Position id is required to modify a trade', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${trade.metaapi_account_id}/trade`;

    const body = {
      actionType: 'POSITION_MODIFY',
      positionId,
    };

    if (modifications.stopLoss !== undefined) {
      body.stopLoss = modifications.stopLoss;
    }
    if (modifications.takeProfit !== undefined) {
      body.takeProfit = modifications.takeProfit;
    }

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    const data = await this.handleResponse(response);

    return {
      modified: true,
      raw: data,
    };
  }

  async partialClose(trade, percentage) {
    const positionId = trade.broker_position_id || trade.broker_ticket;
    if (!positionId) {
      throw new GatewayError('Position id is required to partially close a trade', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const remainingVolume = Number(trade.remaining_volume || trade.volume || 0);
    const closeVolume = Number(((remainingVolume * percentage) / 100).toFixed(2));

    if (closeVolume <= 0) {
      throw new GatewayError('Calculated close volume is zero', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${trade.metaapi_account_id}/trade`;

    const body = {
      actionType: 'POSITION_PARTIAL',
      positionId,
      volume: closeVolume,
    };

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    const data = await this.handleResponse(response);

    return {
      partialClose: true,
      closedVolume: closeVolume,
      remainingVolume: remainingVolume - closeVolume,
      raw: data,
    };
  }

  async placePendingOrder(request) {
    return this.openPosition(request);
  }

  async cancelPendingOrder(request) {
    const orderId = request.broker_order_id;
    if (!orderId) {
      throw new GatewayError('Order id is required to cancel a pending order', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${request.metaapi_account_id}/trade`;

    const body = {
      actionType: 'ORDER_CANCEL',
      orderId,
    };

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    const data = await this.handleResponse(response);

    return {
      cancelled: true,
      raw: data,
    };
  }

  async syncPositions(brokerAccount) {
    if (!brokerAccount.metaapi_account_id) {
      throw new GatewayError('MetaApi account id is required', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${brokerAccount.metaapi_account_id}/positions`;

    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    const data = await this.handleResponse(response);

    return Array.isArray(data) ? data : data.positions || [];
  }

  async getAccountInfo(brokerAccount) {
    if (!brokerAccount.metaapi_account_id) {
      throw new GatewayError('MetaApi account id is required', {
        errorType: 'INVALID_REQUEST',
      });
    }

    const url = `${this.config.baseUrl}/users/current/accounts/${brokerAccount.metaapi_account_id}/account-information`;

    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    const data = await this.handleResponse(response);

    return {
      balance: data.balance ?? null,
      equity: data.equity ?? null,
      margin: data.margin ?? null,
      freeMargin: data.freeMargin ?? null,
      marginLevel: data.marginLevel ?? null,
      currency: data.currency || null,
      leverage: data.leverage ?? null,
      raw: data,
    };
  }
}

export default MetaApiGateway;