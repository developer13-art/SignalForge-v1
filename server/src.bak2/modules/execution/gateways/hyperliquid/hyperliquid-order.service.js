'use strict';

const crypto = require('crypto');

const hyperliquidClient = require('./hyperliquid-client.service');
const hyperliquidMarket = require('./hyperliquid-market.service');
const hyperliquidRepository = require('./hyperliquid.repository');

const {
  HYPERLIQUID_ACTIONS,
  HYPERLIQUID_SIDES,
  HYPERLIQUID_ORDER_TYPES,
  HYPERLIQUID_TIF,
  HYPERLIQUID_TIF_DEFAULT,
  HYPERLIQUID_MIN_ORDER_USD,
  HYPERLIQUID_MAX_ORDER_USD,
  HYPERLIQUID_DEFAULT_SLIPPAGE_BPS,
  HYPERLIQUID_MAX_SLIPPAGE_BPS,
  HYPERLIQUID_METRICS,
} = require('./hyperliquid.constants');

const {
  InvalidRequestError,
  OrderFailedError,
  CancelFailedError,
  ModifyFailedError,
  PriceOutOfBoundsError,
  SizeOutOfBoundsError,
} = require('./hyperliquid.errors');

/**
 * SignalForge - Hyperliquid Order Service
 *
 * Builds and submits Hyperliquid orders. The service never signs on
 * behalf of users; it delegates signing to the signer module, which in
 * turn uses the user's delegated agent key or the platform's signing
 * backend. The service focuses on validation, submission, and
 * persistence.
 */

function generateOrderId() {
  return `hl_${crypto.randomBytes(10).toString('hex')}`;
}

function generateCloid() {
  return `0x${crypto.randomBytes(16).toString('hex')}`;
}

function normalizeSide(side) {
  if (!side) {
    throw new InvalidRequestError('side is required');
  }
  const upper = String(side).toUpperCase();
  if (['BUY', 'LONG', 'B'].includes(upper)) {
    return HYPERLIQUID_SIDES.BUY;
  }
  if (['SELL', 'SHORT', 'A'].includes(upper)) {
    return HYPERLIQUID_SIDES.SELL;
  }
  throw new InvalidRequestError(`Unsupported side: ${side}`);
}

function normalizeOrderType(orderType) {
  if (!orderType) {
    return HYPERLIQUID_ORDER_TYPES.LIMIT;
  }
  const upper = String(orderType).toUpperCase();
  if (upper === 'MARKET') {
    return HYPERLIQUID_ORDER_TYPES.LIMIT;
  }
  if (upper === 'LIMIT') {
    return HYPERLIQUID_ORDER_TYPES.LIMIT;
  }
  if (upper === 'TRIGGER' || upper === 'STOP' || upper === 'STOP_LIMIT') {
    return HYPERLIQUID_ORDER_TYPES.TRIGGER;
  }
  throw new InvalidRequestError(`Unsupported order type: ${orderType}`);
}

function normalizeTif(tif) {
  if (!tif) {
    return HYPERLIQUID_TIF_DEFAULT;
  }
  const upper = String(tif).trim();
  const allowed = Object.values(HYPERLIQUID_TIF);
  if (!allowed.includes(upper)) {
    throw new InvalidRequestError(`Unsupported time-in-force: ${tif}`);
  }
  return upper;
}

function normalizePrice(price, decimals = 6) {
  if (price === undefined || price === null || price === '') {
    return null;
  }
  const numeric = Number(price);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new PriceOutOfBoundsError('price must be a positive number', { price });
  }
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(numeric * factor) / factor;
  if (String(rounded).replace('.', '').replace('-', '').replace(/^0+/, '').length > 5) {
    // Hyperliquid allows at most 5 significant figures for prices.
    const significant = Number(rounded.toPrecision(5));
    return significant;
  }
  return rounded;
}

function normalizeSize(size, decimals = 6) {
  if (size === undefined || size === null || size === '') {
    throw new SizeOutOfBoundsError('size is required');
  }
  const numeric = Number(size);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new SizeOutOfBoundsError('size must be a positive number', { size });
  }
  const factor = Math.pow(10, decimals);
  return Math.round(numeric * factor) / factor;
}

function roundNotional(price, size) {
  return Math.round(Number(price) * Number(size) * 100) / 100;
}

function assertNotional({ price, size, symbol }) {
  const notional = roundNotional(price, size);
  if (notional < HYPERLIQUID_MIN_ORDER_USD || notional > HYPERLIQUID_MAX_ORDER_USD) {
    throw new SizeOutOfBoundsError(
      `Order notional must be between ${HYPERLIQUID_MIN_ORDER_USD} and ${HYPERLIQUID_MAX_ORDER_USD} USD`,
      { symbol, notional },
    );
  }
  return notional;
}

function buildOrderPayload({
  assetIndex,
  side,
  price,
  size,
  reduceOnly = false,
  orderType = HYPERLIQUID_ORDER_TYPES.LIMIT,
  tif = HYPERLIQUID_TIF_DEFAULT,
  triggerPrice,
  isTrigger = false,
}) {
  const wire = {
    a: assetIndex,
    b: side === HYPERLIQUID_SIDES.BUY,
    p: String(price),
    s: String(size),
    r: reduceOnly,
    t: {
      limit: isTrigger
        ? { tif }
        : { tif },
    },
  };

  if (isTrigger) {
    wire.t.trigger = {
      isMarket: orderType === HYPERLIQUID_ORDER_TYPES.TRIGGER,
      triggerPx: String(triggerPrice),
      isMarket: false,
    };
  }

  return wire;
}

async function submitOrder({
  userId,
  accountId,
  symbol,
  side,
  size,
  price,
  orderType = 'limit',
  tif,
  reduceOnly = false,
  triggerPrice,
  slippageBps = HYPERLIQUID_DEFAULT_SLIPPAGE_BPS,
  signer,
}) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  if (!signer) {
    throw new InvalidRequestError('A signer is required to submit orders');
  }

  const normalizedSide = normalizeSide(side);
  const normalizedType = normalizeOrderType(orderType);
  const normalizedTif = normalizeTif(tif);
  const normalizedSymbol = hyperliquidMarket.normalizeSymbol(symbol);

  const market = await hyperliquidMarket.findMarket(normalizedSymbol);
  const szDecimals = market.szDecimals || 6;

  let effectivePrice = normalizePrice(price, Math.max(0, 6 - szDecimals));
  const effectiveSize = normalizeSize(size, szDecimals);

  if (!effectivePrice) {
    const mid = await hyperliquidMarket.fetchMidPrice(normalizedSymbol);
    const slippage = Math.min(Math.max(Number(slippageBps) || 0, 0), HYPERLIQUID_MAX_SLIPPAGE_BPS);
    const slippageFactor = 1 + (normalizedSide === HYPERLIQUID_SIDES.BUY ? 1 : -1) * (slippage / 10000);
    effectivePrice = normalizePrice(mid * slippageFactor, Math.max(0, 6 - szDecimals));
  }

  const notional = assertNotional({ price: effectivePrice, size: effectiveSize, symbol: normalizedSymbol });

  const cloid = generateCloid();
  const orderId = generateOrderId();

  await hyperliquidRepository.createOrder(null, {
    id: orderId,
    userId,
    accountId,
    cloid,
    symbol: normalizedSymbol,
    side: normalizedSide,
    orderType: normalizedType,
    tif: normalizedTif,
    size: effectiveSize,
    price: effectivePrice,
    triggerPrice: triggerPrice || null,
    reduceOnly,
    status: 'pending',
  });

  try {
    const wire = buildOrderPayload({
      assetIndex: market.assetIndex || 0,
      side: normalizedSide,
      price: effectivePrice,
      size: effectiveSize,
      reduceOnly,
      orderType: normalizedType,
      tif: normalizedTif,
      triggerPrice,
      isTrigger: Boolean(triggerPrice),
    });

    const payload = {
      action: {
        type: HYPERLIQUID_ACTIONS.ORDER,
        orders: [wire],
        grouping: 'na',
      },
      nonce: Date.now(),
      vaultAddress: null,
    };

    const signed = await signer.sign(payload);

    const response = await hyperliquidClient.postExchange(signed);

    const status = response && response.status ? response.status : 'unknown';

    await hyperliquidRepository.updateOrderStatus(orderId, {
      status,
      exchangeResponse: response,
      submittedAt: new Date().toISOString(),
    });

    return {
      orderId,
      cloid,
      status,
      symbol: normalizedSymbol,
      side: normalizedSide,
      price: effectivePrice,
      size: effectiveSize,
      notional,
      response,
      metric: HYPERLIQUID_METRICS.ORDERS,
    };
  } catch (error) {
    await hyperliquidRepository.updateOrderStatus(orderId, {
      status: 'failed',
      errorMessage: error.message,
    });
    if (error instanceof OrderFailedError) {
      throw error;
    }
    throw new OrderFailedError('Failed to submit Hyperliquid order', {
      reason: error.message,
      orderId,
    });
  }
}

async function cancelOrder({ userId, orderId, signer }) {
  if (!orderId) {
    throw new InvalidRequestError('orderId is required');
  }
  if (!signer) {
    throw new InvalidRequestError('A signer is required to cancel orders');
  }

  const order = await hyperliquidRepository.findOrderById(orderId);
  if (!order) {
    throw new InvalidRequestError('Order was not found', { orderId });
  }

  const market = await hyperliquidMarket.findMarket(order.symbol);

  try {
    const payload = {
      action: {
        type: HYPERLIQUID_ACTIONS.CANCEL,
        cancels: [{ a: market.assetIndex || 0, o: order.cloid || order.id }],
      },
      nonce: Date.now(),
      vaultAddress: null,
    };

    const signed = await signer.sign(payload);
    const response = await hyperliquidClient.postExchange(signed);

    await hyperliquidRepository.updateOrderStatus(orderId, {
      status: 'cancelled',
      exchangeResponse: response,
    });

    return { orderId, status: 'cancelled', response };
  } catch (error) {
    throw new CancelFailedError('Failed to cancel Hyperliquid order', {
      reason: error.message,
      orderId,
    });
  }
}

async function modifyOrder({ userId, orderId, price, size, signer }) {
  if (!orderId) {
    throw new InvalidRequestError('orderId is required');
  }
  if (!signer) {
    throw new InvalidRequestError('A signer is required to modify orders');
  }

  const order = await hyperliquidRepository.findOrderById(orderId);
  if (!order) {
    throw new InvalidRequestError('Order was not found', { orderId });
  }

  const market = await hyperliquidMarket.findMarket(order.symbol);

  const wire = buildOrderPayload({
    assetIndex: market.assetIndex || 0,
    side: order.side,
    price: normalizePrice(price || order.price, Math.max(0, 6 - (market.szDecimals || 6))),
    size: normalizeSize(size || order.size, market.szDecimals || 6),
    reduceOnly: order.reduce_only === true,
    orderType: order.order_type,
    tif: order.tif,
  });

  try {
    const payload = {
      action: {
        type: HYPERLIQUID_ACTIONS.MODIFY,
        oid: order.cloid || order.id,
        order: wire,
      },
      nonce: Date.now(),
      vaultAddress: null,
    };

    const signed = await signer.sign(payload);
    const response = await hyperliquidClient.postExchange(signed);

    await hyperliquidRepository.updateOrderStatus(orderId, {
      status: 'modified',
      exchangeResponse: response,
    });

    return { orderId, status: 'modified', response };
  } catch (error) {
    throw new ModifyFailedError('Failed to modify Hyperliquid order', {
      reason: error.message,
      orderId,
    });
  }
}

async function listUserOrders({ userId, symbol, status, page, pageSize }) {
  return hyperliquidRepository.listOrders({ userId, symbol, status, page, pageSize });
}

async function getOrder(orderId) {
  return hyperliquidRepository.findOrderById(orderId);
}

module.exports = {
  generateOrderId,
  generateCloid,
  normalizeSide,
  normalizeOrderType,
  normalizeTif,
  normalizePrice,
  normalizeSize,
  assertNotional,
  buildOrderPayload,
  submitOrder,
  cancelOrder,
  modifyOrder,
  listUserOrders,
  getOrder,
};