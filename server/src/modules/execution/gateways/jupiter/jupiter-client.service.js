'use strict';

const {
  JUPITER_BASE_URLS,
  JUPITER_ENDPOINTS,
  JUPITER_ERROR_CODES,
} = require('./jupiter.constants');

const {
  QuoteFailedError,
  SwapFailedError,
  RateLimitedError,
  ServiceUnavailableError,
} = require('./jupiter.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Jupiter Client Service
 *
 * Thin HTTP client for the Jupiter quote and swap endpoints. All
 * network access is centralized here so that retries, timeouts, and
 * error translation are consistent across the gateway.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function resolveBaseUrl() {
  const gatewayConfig = config.gateways.jupiter || {};
  return gatewayConfig.baseUrl || JUPITER_BASE_URLS.LITE;
}

function resolveApiKey() {
  const gatewayConfig = config.gateways.jupiter || {};
  return gatewayConfig.apiKey || null;
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

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const apiKey = resolveApiKey();
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new ServiceUnavailableError('Jupiter request timed out', {
        url: url.toString(),
        timeoutMs,
      });
    }
    throw new ServiceUnavailableError('Jupiter request failed', {
      url: url.toString(),
      reason: error.message,
    });
  }
  clearTimeout(timer);

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    throw new RateLimitedError('Jupiter rate limit exceeded', {
      retryAfter: retryAfter ? Number(retryAfter) : null,
    });
  }

  if (response.status >= 500) {
    throw new ServiceUnavailableError('Jupiter service unavailable', {
      status: response.status,
    });
  }

  let data = null;
  const text = await response.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_error) {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    throw new QuoteFailedError(`Jupiter request failed with status ${response.status}`, {
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
  onlyDirectRoutes = false,
  restrictIntermediateTokens = true,
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
    onlyDirectRoutes: onlyDirectRoutes ? 'true' : 'false',
    restrictIntermediateTokens: restrictIntermediateTokens ? 'true' : 'false',
  };

  const data = await request(JUPITER_ENDPOINTS.QUOTE, {
    method: 'GET',
    query,
    timeoutMs,
  });

  if (!data || !data.outAmount) {
    throw new QuoteFailedError('Jupiter returned an empty quote', { query });
  }

  return data;
}

async function fetchSwap({
  quoteResponse,
  userPublicKey,
  wrapAndUnwrapSol = true,
  useSharedAccounts = true,
  feeAccount,
  computeUnitPriceMicroLamports,
  asLegacyTransaction = false,
  dynamicComputeUnitLimit = true,
  prioritizationFeeLamports,
  timeoutMs,
}) {
  if (!quoteResponse || !userPublicKey) {
    throw new SwapFailedError('quoteResponse and userPublicKey are required');
  }

  const body = {
    quoteResponse,
    userPublicKey,
    wrapAndUnwrapSol,
    useSharedAccounts,
    asLegacyTransaction,
    dynamicComputeUnitLimit,
  };

  if (feeAccount) {
    body.feeAccount = feeAccount;
  }
  if (computeUnitPriceMicroLamports !== undefined && computeUnitPriceMicroLamports !== null) {
    body.computeUnitPriceMicroLamports = computeUnitPriceMicroLamports;
  }
  if (prioritizationFeeLamports !== undefined && prioritizationFeeLamports !== null) {
    body.prioritizationFeeLamports = prioritizationFeeLamports;
  }

  const data = await request(JUPITER_ENDPOINTS.SWAP, {
    method: 'POST',
    body,
    timeoutMs,
  });

  if (!data || !data.swapTransaction) {
    throw new SwapFailedError('Jupiter returned an empty swap response');
  }

  return data;
}

async function fetchSwapInstructions({
  quoteResponse,
  userPublicKey,
  wrapAndUnwrapSol = true,
  useSharedAccounts = true,
  feeAccount,
  computeUnitPriceMicroLamports,
  timeoutMs,
}) {
  const body = {
    quoteResponse,
    userPublicKey,
    wrapAndUnwrapSol,
    useSharedAccounts,
  };

  if (feeAccount) {
    body.feeAccount = feeAccount;
  }
  if (computeUnitPriceMicroLamports !== undefined && computeUnitPriceMicroLamports !== null) {
    body.computeUnitPriceMicroLamports = computeUnitPriceMicroLamports;
  }

  const data = await request(JUPITER_ENDPOINTS.SWAP_INSTRUCTIONS, {
    method: 'POST',
    body,
    timeoutMs,
  });

  if (!data) {
    throw new SwapFailedError('Jupiter returned empty swap instructions');
  }

  return data;
}

async function fetchTokens({ timeoutMs } = {}) {
  const data = await request(JUPITER_ENDPOINTS.TOKENS, {
    method: 'GET',
    timeoutMs: timeoutMs || 30000,
  });
  return Array.isArray(data) ? data : [];
}

async function fetchPrices({ mints = [], timeoutMs } = {}) {
  if (!Array.isArray(mints) || mints.length === 0) {
    return {};
  }
  const query = { ids: mints.join(',') };
  const data = await request(JUPITER_ENDPOINTS.PRICE, {
    method: 'GET',
    query,
    timeoutMs,
  });
  return data || {};
}

function mapJupiterErrorCode(status, body) {
  if (status === 429) {
    return JUPITER_ERROR_CODES.RATE_LIMITED;
  }
  if (status >= 500) {
    return JUPITER_ERROR_CODES.SERVICE_UNAVAILABLE;
  }
  if (body && body.error && body.error.code) {
    return body.error.code;
  }
  return JUPITER_ERROR_CODES.QUOTE_FAILED;
}

function clearCache() {
  // Reserved for future caching layers.
}

module.exports = {
  resolveBaseUrl,
  resolveApiKey,
  request,
  fetchQuote,
  fetchSwap,
  fetchSwapInstructions,
  fetchTokens,
  fetchPrices,
  mapJupiterErrorCode,
  clearCache,
};