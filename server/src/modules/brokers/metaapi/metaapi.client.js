/**
 * MetaApi Client
 *
 * Thin client for the MetaApi REST API. Used exclusively by the
 * MetaApi service classes. All requests are proxied through the
 * backend, and credentials remain server-side.
 *
 * @module signalforge/server/modules/brokers/metaapi/client
 */
const metaApiConfig = require('../../../config/metaapi.config.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { BrokerConnectionError, BrokerDeploymentError, BrokerRateLimitError, BrokerSyncError } = require('../broker.errors.js');
class MetaApiClient {
  constructor(config = null) {
    this.config = config || metaApiConfig;
    this.logger = getLogger('metaapi-client');
  }

  buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'auth-token': this.config.token,
    };
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new Error('TIMEOUT')),
      this.config.requestTimeoutMs,
    );
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new BrokerConnectionError('MetaApi request timed out', {
          url,
        });
      }
      throw new BrokerConnectionError('MetaApi request failed', {
        url,
        cause: error.cause?.code
          ? `${error.message} (${error.cause.code})`
          : error.message,
        networkCode: error.cause?.code || null,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async handleResponse(response, errorClass) {
    if (response.status === 429) {
      throw new BrokerRateLimitError('MetaApi rate limit exceeded');
    }
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const responseText = await response.text();
      let responseBody = null;
      try {
        responseBody = JSON.parse(responseText);
      } catch (_error) {
        responseBody = null;
      }
      const upstreamMessage =
        (typeof responseBody?.message === 'string' && responseBody.message) ||
        (typeof responseBody?.error === 'string' && responseBody.error) ||
        null;
      const details = {
        status: response.status,
        ...(upstreamMessage ? { cause: upstreamMessage } : {}),
        ...(typeof responseBody?.error === 'string' ? { upstreamCode: responseBody.error } : {}),
      };

      if (response.status === 401 || response.status === 403) {
        throw new BrokerConnectionError(
          upstreamMessage || 'MetaApi authentication failed',
          details,
        );
      }
      throw new (errorClass || BrokerConnectionError)(
        upstreamMessage || `MetaApi responded with status ${response.status}`,
        details,
      );
    }

    return response.json();
  }

  async createAccount(payload) {
    const url = `${this.config.provisioningUrl}/users/current/accounts`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response, BrokerDeploymentError);
  }

  async getAccount(metaApiAccountId) {
    const url = `${this.config.provisioningUrl}/users/current/accounts/${metaApiAccountId}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerConnectionError);
  }

  async listAccounts() {
    const url = `${this.config.provisioningUrl}/users/current/accounts`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerConnectionError);
  }

  async updateAccount(metaApiAccountId, payload) {
    const url = `${this.config.provisioningUrl}/users/current/accounts/${metaApiAccountId}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response, BrokerConnectionError);
  }

  async deleteAccount(metaApiAccountId) {
    const url = `${this.config.provisioningUrl}/users/current/accounts/${metaApiAccountId}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerConnectionError);
  }

  async deployAccount(metaApiAccountId) {
    const url = `${this.config.provisioningUrl}/users/current/accounts/${metaApiAccountId}/deploy`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerDeploymentError);
  }

  async undeployAccount(metaApiAccountId) {
    const url = `${this.config.provisioningUrl}/users/current/accounts/${metaApiAccountId}/undeploy`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerDeploymentError);
  }

  async getAccountInformation(metaApiAccountId) {
    const url = `${this.config.baseUrl}/users/current/accounts/${metaApiAccountId}/account-information`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerSyncError);
  }

  async getPositions(metaApiAccountId) {
    const url = `${this.config.baseUrl}/users/current/accounts/${metaApiAccountId}/positions`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerSyncError);
  }

  async getOrders(metaApiAccountId) {
    const url = `${this.config.baseUrl}/users/current/accounts/${metaApiAccountId}/orders`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerSyncError);
  }

  async getHistoryOrders(metaApiAccountId, startTime, endTime) {
    const url = `${this.config.baseUrl}/users/current/accounts/${metaApiAccountId}/history-orders/time/${startTime}/${endTime}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerSyncError);
  }

  async getSymbolSpecification(metaApiAccountId, symbol) {
    const url = `${this.config.baseUrl}/users/current/accounts/${metaApiAccountId}/symbols/${symbol}/specification`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerSyncError);
  }

  async getCurrentPrice(metaApiAccountId, symbol) {
    const url = `${this.config.baseUrl}/users/current/accounts/${metaApiAccountId}/symbols/${symbol}/current-price`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse(response, BrokerSyncError);
  }

  async isConfigured() {
    return Boolean(this.config.enabled && this.config.token);
  }
}
module.exports = MetaApiClient;
module.exports.MetaApiClient = MetaApiClient;
