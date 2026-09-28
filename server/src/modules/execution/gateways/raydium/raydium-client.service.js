'use strict';

const {
  RAYDIUM_ENDPOINTS,
  RAYDIUM_ERROR_CODES,
} = require('./raydium.constants');

const {
  QuoteFailedError,
  SwapFailedError,
  RateLimitedError,
  ServiceUnavailableError,
} = require('./raydium.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Raydium Client Service
 *
 * HTTP client for the Raydium swap API. All network access is
 * centralized here so retries, timeouts, and error translation stay
 * consistent across the gateway.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function resolveBaseUrl() {
  const gatewayConfig = config.gateways.raydium || {};
  return gatewayConfig.baseUrl || 'https://transaction-v1.raydium.io';
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
      throw new ServiceUnavailableError('Raydium request timed out', {
        url: url.toString(),
        timeoutMs,
      });
    }
    throw new ServiceUnavailableError('Raydium request failed', {
      reason: error.message,
    });
  }
  clearTimeout(timer);

  if (response.status === 429) {
    throw new RateLimitedError('Raydium rate limit exceeded');
  }
  if (response.status >= 500) {
    throw new ServiceUnavailableError('Raydium service unavailable', {
      status: response.status,
    });
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
    throw new QuoteFailedError(`Raydium returned status ${response.status}`, {
      status: response.status,
      body: data,
    });
  }

  return data;
}

async function computeSwapBaseIn({
  inputMint,
  outputMint,
  amount,
  slippageBps,
  txVersion = 'V0',
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
    txVersion,
  };

  const data = await request(RAYDIUM_ENDPOINTS.COMPUTE_SWAP, {
    method: 'GET',
    query,
    timeoutMs,
  });

  if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
    throw new QuoteFailedError('Raydium returned an empty quote', { query });
  }

  return data;
}

async function computeSwapBaseOut({
  inputMint,
  outputMint,
  amount,
  slippageBps,
  txVersion = 'V0',
  timeoutMs,
}) {
  const query = {
    inputMint,
    outputMint,
    amount: String(amount),
    slippageBps: String(slippageBps),
    txVersion,
  };

  const data = await request(RAYDIUM_ENDPOINTS.COMPUTE_SWAP_BASE_OUT, {
    method: 'GET',
    query,
    timeoutMs,
  });

  if (!data || !data.data || !Array.isArray(data.data)) {
    throw new QuoteFailedError('Raydium returned an empty quote (base out)', { query });
  }

  return data;
}

async function buildSwapTransaction({
  computeUnitPriceMicroLamports,
  swapResponse,
  wallet,
  txVersion = 'V0',
  wrapSol = true,
  unwrapSol = true,
  timeoutMs,
}) {
  if (!swapResponse || !wallet) {
    throw new SwapFailedError('swapResponse and wallet are required');
  }

  const body = {
    computeUnitPriceMicroLamports: computeUnitPriceMicroLamports || 0,
    swapResponse,
    wallet,
    txVersion,
    wrapSol,
    unwrapSol,
  };

  const data = await request(RAYDIUM_ENDPOINTS.TRANSACTION_SWAP, {
    method: 'POST',
    body,
    timeoutMs,
  });

  if (!data || !Array.isArray(data.data) || data.data.length === 0) {
    throw new SwapFailedError('Raydium returned an empty transaction response');
  }

  return data;
}

async function fetchPools({ poolType, page = 1, pageSize = 100, timeoutMs } = {}) {
  const query = { page: String(page), pageSize: String(pageSize) };
  if (poolType) {
    query.type = poolType;
  }
  const data = await request(RAYDIUM_ENDPOINTS.POOLS, {
    method: 'GET',
    query,
    timeoutMs,
  });
  return data || { data: [] };
}

async function fetchPoolInfo({ ids = [], timeoutMs } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { data: [] };
  }
  const query = { ids: ids.join(',') };
  const data = await request(RAYDIUM_ENDPOINTS.POOL_INFO, {
    method: 'GET',
    query,
    timeoutMs,
  });
  return data || { data: [] };
}

async function fetchPoolKeys({ ids = [], timeoutMs } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { data: [] };
  }
  const query = { ids: ids.join(',') };
  const data = await request(RAYDIUM_ENDPOINTS.POOL_KEY, {
    method: 'GET',
    query,
    timeoutMs,
  });
  return data || { data: [] };
}

async function fetchPriorityFee({ timeoutMs } = {}) {
  const data = await request(RAYDIUM_ENDPOINTS.PRIORITY_FEE, {
    method: 'GET',
    timeoutMs,
  });
  return data || {};
}

function mapErrorCode(status, body) {
  if (status === 429) {
    return RAYDIUM_ERROR_CODES.RATE_LIMITED;
  }
  if (status >= 500) {
    return RAYDIUM_ERROR_CODES.SERVICE_UNAVAILABLE;
  }
  if (body && body.error) {
    return body.error;
  }
  return RAYDIUM_ERROR_CODES.QUOTE_FAILED;
}

module.exports = {
  resolveBaseUrl,
  request,
  computeSwapBaseIn,
  computeSwapBaseOut,
  buildSwapTransaction,
  fetchPools,
  fetchPoolInfo,
  fetchPoolKeys,
  fetchPriorityFee,
  mapErrorCode,
};