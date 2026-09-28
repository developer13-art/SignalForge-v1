'use strict';

const {
  DRIFT_ENDPOINTS,
  DRIFT_DLOB_URLS,
} = require('./drift.constants');

const {
  InvalidRequestError,
  RateLimitedError,
  ServiceUnavailableError,
} = require('./drift.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Drift Client Service
 *
 * HTTP client for the Drift DLOB (Decentralized Limit Order Book)
 * endpoints and the Drift markets API. Transactions are constructed
 * and signed by the order service; this client only handles HTTP.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function resolveBaseUrl() {
  const gatewayConfig = config.gateways.drift || {};
  if (gatewayConfig.baseUrl) {
    return gatewayConfig.baseUrl;
  }
  const network = String(config.network || 'mainnet-beta').toLowerCase();
  return network.includes('devnet') ? DRIFT_DLOB_URLS.DEVNET : DRIFT_DLOB_URLS.MAINNET;
}

async function request(path, { method = 'GET', query, body, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const baseUrl = resolveBaseUrl();
  const url = new URL(path, baseUrl);

  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new ServiceUnavailableError('Drift request timed out', {
        url: url.toString(),
        timeoutMs,
      });
    }
    throw new ServiceUnavailableError('Drift request failed', { reason: error.message });
  }
  clearTimeout(timer);

  if (response.status === 429) {
    throw new RateLimitedError('Drift rate limit exceeded');
  }
  if (response.status >= 500) {
    throw new ServiceUnavailableError('Drift service unavailable', { status: response.status });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_error) {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    throw new ServiceUnavailableError(`Drift returned status ${response.status}`, {
      status: response.status,
      body: data,
    });
  }

  return data;
}

async function fetchMarkets({ timeoutMs } = {}) {
  return request(DRIFT_ENDPOINTS.MARKETS, { method: 'GET', timeoutMs });
}

async function fetchOracles({ timeoutMs } = {}) {
  return request(DRIFT_ENDPOINTS.ORACLES, { method: 'GET', timeoutMs });
}

async function fetchOrderbook({ market, depth = 20, timeoutMs } = {}) {
  if (!market) {
    throw new InvalidRequestError('market is required');
  }
  return request(DRIFT_ENDPOINTS.ORDERBOOK, {
    method: 'GET',
    query: { market, depth: String(depth) },
    timeoutMs,
  });
}

async function fetchMarketPrice({ market, timeoutMs } = {}) {
  if (!market) {
    throw new InvalidRequestError('market is required');
  }
  return request(DRIFT_ENDPOINTS.DLOB, {
    method: 'GET',
    query: { market },
    timeoutMs,
  });
}

function mapErrorCode(status, body) {
  if (status === 429) {
    return 'DRIFT_RATE_LIMITED';
  }
  if (status >= 500) {
    return 'DRIFT_SERVICE_UNAVAILABLE';
  }
  if (body && body.error) {
    return body.error;
  }
  return 'DRIFT_INTERNAL_ERROR';
}

module.exports = {
  resolveBaseUrl,
  request,
  fetchMarkets,
  fetchOracles,
  fetchOrderbook,
  fetchMarketPrice,
  mapErrorCode,
};