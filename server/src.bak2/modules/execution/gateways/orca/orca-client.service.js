'use strict';

const {
  ORCA_ENDPOINTS,
} = require('./orca.constants');

const {
  QuoteFailedError,
  SwapFailedError,
  RateLimitedError,
  ServiceUnavailableError,
} = require('./orca.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Orca Client Service
 *
 * HTTP client for the Orca SDK API. All network access is centralized
 * here so that timeouts, retries, and error translation remain
 * consistent across the gateway.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function resolveBaseUrl() {
  const gatewayConfig = config.gateways.orca || {};
  return gatewayConfig.baseUrl || 'https://api.orca.so';
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
      throw new ServiceUnavailableError('Orca request timed out', {
        url: url.toString(),
        timeoutMs,
      });
    }
    throw new ServiceUnavailableError('Orca request failed', { reason: error.message });
  }
  clearTimeout(timer);

  if (response.status === 429) {
    throw new RateLimitedError('Orca rate limit exceeded');
  }
  if (response.status >= 500) {
    throw new ServiceUnavailableError('Orca service unavailable', { status: response.status });
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
    throw new QuoteFailedError(`Orca returned status ${response.status}`, {
      status: response.status,
      body: data,
    });
  }

  return data;
}

async function fetchQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps,
  swapMode = 'ExactIn',
  timeoutMs,
}) {
  if (!inputMint || !outputMint || !amount) {
    throw new QuoteFailedError('inputMint, outputMint, and amount are required');
  }

  const query = {
    inputMint,
    outputMint,
    amount: String(amount),
    slippageBps: String(slippageBps),
    swapMode,
  };

  const data = await request(ORCA_ENDPOINTS.QUOTE, {
    method: 'GET',
    query,
    timeoutMs,
  });

  if (!data) {
    throw new QuoteFailedError('Orca returned an empty quote', { query });
  }

  return data;
}

async function fetchSwap({
  quoteResponse,
  userPublicKey,
  wrapAndUnwrapSol = true,
  computeUnitPriceMicroLamports,
  timeoutMs,
}) {
  if (!quoteResponse || !userPublicKey) {
    throw new SwapFailedError('quoteResponse and userPublicKey are required');
  }

  const body = {
    quoteResponse,
    userPublicKey,
    wrapAndUnwrapSol,
  };

  if (computeUnitPriceMicroLamports !== undefined && computeUnitPriceMicroLamports !== null) {
    body.computeUnitPriceMicroLamports = computeUnitPriceMicroLamports;
  }

  const data = await request(ORCA_ENDPOINTS.SWAP, {
    method: 'POST',
    body,
    timeoutMs,
  });

  if (!data) {
    throw new SwapFailedError('Orca returned an empty swap response');
  }

  return data;
}

async function fetchPools({ poolType, page = 1, pageSize = 100, timeoutMs } = {}) {
  const query = { page: String(page), pageSize: String(pageSize) };
  if (poolType) {
    query.type = poolType;
  }
  return request(ORCA_ENDPOINTS.POOLS, { method: 'GET', query, timeoutMs });
}

async function fetchPoolInfo({ id, timeoutMs } = {}) {
  if (!id) {
    throw new QuoteFailedError('Pool id is required');
  }
  return request(`${ORCA_ENDPOINTS.POOL_INFO}/${id}`, { method: 'GET', timeoutMs });
}

async function fetchWhirlpools({ timeoutMs } = {}) {
  return request(ORCA_ENDPOINTS.WHIRLPOOLS, { method: 'GET', timeoutMs });
}

async function fetchTokens({ timeoutMs } = {}) {
  return request(ORCA_ENDPOINTS.TOKENS, { method: 'GET', timeoutMs: timeoutMs || 30000 });
}

function mapErrorCode(status, body) {
  if (status === 429) {
    return 'ORCA_RATE_LIMITED';
  }
  if (status >= 500) {
    return 'ORCA_SERVICE_UNAVAILABLE';
  }
  if (body && body.error) {
    return body.error;
  }
  return 'ORCA_QUOTE_FAILED';
}

module.exports = {
  resolveBaseUrl,
  request,
  fetchQuote,
  fetchSwap,
  fetchPools,
  fetchPoolInfo,
  fetchWhirlpools,
  fetchTokens,
  mapErrorCode,
};