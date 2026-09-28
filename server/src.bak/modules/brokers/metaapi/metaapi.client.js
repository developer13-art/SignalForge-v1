/**
 * MetaApi Client
 *
 * Thin client for the MetaApi REST API. Used exclusively by the
 * MetaApi service classes. All requests are proxied through the
 * backend, and credentials remain server-side.
 *
 * @module signalforge/server/modules/brokers/metaapi/client
 */

import metaApiConfig from '../../../config/metaapi.config.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  BrokerConnectionError,
  BrokerDeploymentError,
  BrokerRateLimitError,
  BrokerSyncError,
} from '../broker.errors.js';

export class MetaApiClient {
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
        cause: error.message,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async handleResponse(response, errorClass) {
    if (response.status === 429) {
      throw new BrokerRateLimitError('MetaApi rate limit exceeded');
    }
    if (response.status === 401 || response.status === 403) {
      throw new BrokerConnectionError('MetaApi authentication failed', {
        status: response.status,
      });
    }
    if (!response.ok) {
      const text = await response.text();
      throw new (errorClass || BrokerConnectionError)(
        `MetaApi responded with status ${response.status}`,
        {
          status: response.status,
          body: text,
        },
      );
    }
    if (response.status === 204) {
      return null;
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

export default MetaApiClient;