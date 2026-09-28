'use strict';

const {
  HYPERLIQUID_ENDPOINTS,
  HYPERLIQUID_INFO_TYPES,
  HYPERLIQUID_ERROR_CODES,
} = require('./hyperliquid.constants');

const {
  InvalidRequestError,
  RateLimitedError,
  ServiceUnavailableError,
} = require('./hyperliquid.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Hyperliquid Client Service
 *
 * Low-level HTTP client for the Hyperliquid info and exchange APIs.
 * Signing is handled by the order service; this client only transmits
 * payloads and translates HTTP-level errors.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function resolveBaseUrl() {
  const gatewayConfig = config.gateways.hyperliquid || {};
  return gatewayConfig.baseUrl || 'https://api.hyperliquid.xyz';
}

async function postInfo(body, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const url = `${resolveBaseUrl()}${HYPERLIQUID_ENDPOINTS.INFO}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    throw new ServiceUnavailableError('Hyperliquid info request failed', {
      reason: error.message,
    });
  }
  clearTimeout(timer);

  if (response.status === 429) {
    throw new RateLimitedError('Hyperliquid rate limit exceeded');
  }
  if (response.status >= 500) {
    throw new ServiceUnavailableError('Hyperliquid service unavailable', {
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
    throw new ServiceUnavailableError(`Hyperliquid returned status ${response.status}`, {
      status: response.status,
      body: data,
    });
  }

  return data;
}

async function postExchange(body, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const url = `${resolveBaseUrl()}${HYPERLIQUID_ENDPOINTS.EXCHANGE}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    throw new ServiceUnavailableError('Hyperliquid exchange request failed', {
      reason: error.message,
    });
  }
  clearTimeout(timer);

  if (response.status === 429) {
    throw new RateLimitedError('Hyperliquid rate limit exceeded');
  }
  if (response.status >= 500) {
    throw new ServiceUnavailableError('Hyperliquid exchange unavailable', {
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
    throw new ServiceUnavailableError(`Hyperliquid exchange returned status ${response.status}`, {
      status: response.status,
      body: data,
    });
  }

  return data;
}

async function fetchMeta() {
  return postInfo({ type: HYPERLIQUID_INFO_TYPES.META });
}

async function fetchMetaAndAssetCtxs() {
  return postInfo({ type: HYPERLIQUID_INFO_TYPES.META_AND_ASSET_CTXS });
}

async function fetchAllMids() {
  return postInfo({ type: HYPERLIQUID_INFO_TYPES.ALL_MIDS });
}

async function fetchL2Book({ symbol, depth = 20 }) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.L2_BOOK,
    coin: symbol,
    nSigFigs: null,
    mantissa: null,
  });
}

async function fetchCandleSnapshot({ symbol, interval = '1m', startTime, endTime }) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.CANDLE_SNAPSHOT,
    req: {
      coin: symbol,
      interval,
      startTime: startTime || Date.now() - 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now(),
    },
  });
}

async function fetchClearinghouseState({ user }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.CLEARINGHOUSE_STATE,
    user,
  });
}

async function fetchOpenOrders({ user }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.FRONTEND_OPEN_ORDERS,
    user,
  });
}

async function fetchUserFills({ user, aggregateByTime = true }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.USER_FILLS,
    user,
    aggregateByTime,
  });
}

async function fetchOrderStatus({ user, oid }) {
  if (!user || oid === undefined || oid === null) {
    throw new InvalidRequestError('user and oid are required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.ORDER_STATUS,
    user,
    oid,
  });
}

async function fetchFundingHistory({ symbol, startTime, endTime }) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  return postInfo({
    type: HYPERLIQUID_INFO_TYPES.FUNDING_HISTORY,
    coin: symbol,
    startTime: startTime || Date.now() - 24 * 60 * 60 * 1000,
    endTime: endTime || Date.now(),
  });
}

function mapErrorCode(status, body) {
  if (status === 429) {
    return HYPERLIQUID_ERROR_CODES.RATE_LIMITED;
  }
  if (status >= 500) {
    return HYPERLIQUID_ERROR_CODES.SERVICE_UNAVAILABLE;
  }
  if (body && body.error) {
    return body.error;
  }
  return HYPERLIQUID_ERROR_CODES.INTERNAL_ERROR;
}

module.exports = {
  resolveBaseUrl,
  postInfo,
  postExchange,
  fetchMeta,
  fetchMetaAndAssetCtxs,
  fetchAllMids,
  fetchL2Book,
  fetchCandleSnapshot,
  fetchClearinghouseState,
  fetchOpenOrders,
  fetchUserFills,
  fetchOrderStatus,
  fetchFundingHistory,
  mapErrorCode,
};