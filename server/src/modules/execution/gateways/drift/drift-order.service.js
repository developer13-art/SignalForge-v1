'use strict';

const crypto = require('crypto');

const driftClient = require('./drift-client.service');
const driftRepository = require('./drift.repository');
const driftMargin = require('./drift-margin.service');

const {
  DRIFT_ORDER_TYPES,
  DRIFT_ORDER_SIDES,
  DRIFT_TIF_DEFAULT,
  DRIFT_DEFAULT_SLIPPAGE_BPS,
  DRIFT_MAX_SLIPPAGE_BPS,
  DRIFT_MIN_ORDER_USD,
  DRIFT_MAX_ORDER_USD,
  DRIFT_METRICS,
} = require('./drift.constants');

const {
  InvalidRequestError,
  OrderFailedError,
  CancelFailedError,
  ModifyFailedError,
  PriceOutOfBoundsError,
  SizeOutOfBoundsError,
} = require('./drift.errors');

/**
 * SignalForge - Drift Order Service
 *
 * Builds and submits Drift orders. The service delegates signing to
 * the signer module, which is responsible for constructing the
 * on-chain instruction set. The service focuses on validation,
 * submission, and persistence.
 */

function generateOrderId() {
  return `drift_${crypto.randomBytes(10).toString('hex')}`;
}

function normalizeSide(side) {
  if (!side) {
    throw new InvalidRequestError('side is required');
  }
  const normalized = String(side).trim().toLowerCase();
  if (['buy', 'long'].includes(normalized)) {
    return DRIFT_ORDER_SIDES.BUY;
  }
  if (['sell', 'short'].includes(normalized)) {
    return DRIFT_ORDER_SIDES.SELL;
  }
  throw new InvalidRequestError(`Unsupported side: ${side}`);
}

function normalizeOrderType(orderType) {
  if (!orderType) {
    return DRIFT_ORDER_TYPES.MARKET;
  }
  const normalized = String(orderType).trim().toLowerCase();
  if (Object.values(DRIFT_ORDER_TYPES).includes(normalized)) {
    return normalized;
  }
  throw new InvalidRequestError(`Unsupported order type: ${orderType}`);
}

function normalizePrice(price) {
  if (price === undefined || price === null || price === '') {
    return null;
  }
  const numeric = Number(price);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new PriceOutOfBoundsError('price must be a positive number', { price });
  }
  return numeric;
}

function normalizeSize(size) {
  if (size === undefined || size === null || size === '') {
    throw new SizeOutOfBoundsError('size is required');
  }
  const numeric = Number(size);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new SizeOutOfBoundsError('size must be a positive number', { size });
  }
  return numeric;
}

function assertNotional({ price, size, symbol }) {
  const notional = Number(price || 0) * Number(size || 0);
  if (notional < DRIFT_MIN_ORDER_USD || notional > DRIFT_MAX_ORDER_USD) {
    throw new SizeOutOfBoundsError(
      `Order notional must be between ${DRIFT_MIN_ORDER_USD} and ${DRIFT_MAX_ORDER_USD} USD`,
      { symbol, notional },
    );
  }
  return notional;
}

async function resolveEffectivePrice({ marketSymbol, price, side, slippageBps }) {
  if (price) {
    return Number(price);
  }
  const reference = await driftClient.fetchMarketPrice({ market: marketSymbol });
  const referencePrice =
    reference?.price || reference?.markPrice || reference?.mid || reference?.oraclePrice;

  if (!referencePrice) {
    throw new PriceOutOfBoundsError('Unable to resolve a reference price for the market', {
      marketSymbol,
    });
  }

  const slippage = Math.min(
    Math.max(Number(slippageBps) || DRIFT_DEFAULT_SLIPPAGE_BPS, 0),
    DRIFT_MAX_SLIPPAGE_BPS,
  );
  const direction = side === DRIFT_ORDER_SIDES.BUY ? 1 : -1;
  const adjustment = 1 + direction * (slippage / 10000);

  return Number(referencePrice) * adjustment;
}

async function submitOrder({
  userId,
  accountId,
  symbol,
  side,
  size,
  price,
  orderType = 'market',
  tif = DRIFT_TIF_DEFAULT,
  reduceOnly = false,
  triggerPrice,
  slippageBps = DRIFT_DEFAULT_SLIPPAGE_BPS,
  leverage,
  signer,
}) {
  if (!signer) {
    throw new InvalidRequestError('A signer is required to submit orders');
  }

  const market = await driftMargin.findMarket(symbol);
  const normalizedSide = normalizeSide(side);
  const normalizedType = normalizeOrderType(orderType);
  const normalizedSize = normalizeSize(size);

  const effectivePrice = await resolveEffectivePrice({
    marketSymbol: market.symbol,
    price: normalizePrice(price),
    side: normalizedSide,
    slippageBps,
  });

  const notional = assertNotional({
    price: effectivePrice,
    size: normalizedSize,
    symbol: market.symbol,
  });

  const orderId = generateOrderId();

  const persisted = await driftRepository.createOrder(null, {
    id: orderId,
    userId,
    accountId,
    symbol: market.symbol,
    marketIndex: market.market_index,
    side: normalizedSide,
    orderType: normalizedType,
    tif,
    size: normalizedSize,
    price: effectivePrice,
    triggerPrice: triggerPrice || null,
    reduceOnly,
    leverage: leverage || null,
    status: 'pending',
  });

  try {
    const signed = await signer.signOrder({
      marketIndex: market.market_index,
      marketSymbol: market.symbol,
      side: normalizedSide,
      orderType: normalizedType,
      tif,
      size: normalizedSize,
      price: effectivePrice,
      reduceOnly,
      triggerPrice,
    });

    const response = await driftClient.request('/order', {
      method: 'POST',
      body: {
        transaction: signed.transaction,
        signature: signed.signature,
      },
    });

    await driftRepository.updateOrderStatus(orderId, {
      status: 'submitted',
      exchangeResponse: response,
      submittedAt: new Date().toISOString(),
    });

    return {
      orderId,
      status: 'submitted',
      symbol: market.symbol,
      side: normalizedSide,
      price: effectivePrice,
      size: normalizedSize,
      notional,
      signature: signed.signature || null,
      response,
      metric: DRIFT_METRICS.ORDERS,
    };
  } catch (error) {
    await driftRepository.updateOrderStatus(orderId, {
      status: 'failed',
      errorMessage: error.message,
    });
    if (error instanceof OrderFailedError) {
      throw error;
    }
    throw new OrderFailedError('Failed to submit Drift order', {
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

  const order = await driftRepository.findOrderById(orderId);
  if (!order) {
    throw new InvalidRequestError('Order was not found', { orderId });
  }

  try {
    const signed = await signer.cancelOrder({
      marketIndex: order.market_index,
      orderId: order.id,
    });

    const response = await driftClient.request('/cancel', {
      method: 'POST',
      body: {
        transaction: signed.transaction,
        signature: signed.signature,
      },
    });

    await driftRepository.updateOrderStatus(orderId, {
      status: 'cancelled',
      exchangeResponse: response,
    });

    return { orderId, status: 'cancelled', response };
  } catch (error) {
    throw new CancelFailedError('Failed to cancel Drift order', {
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

  const order = await driftRepository.findOrderById(orderId);
  if (!order) {
    throw new InvalidRequestError('Order was not found', { orderId });
  }

  const effectivePrice = price ? normalizePrice(price) : Number(order.price);
  const effectiveSize = size ? normalizeSize(size) : Number(order.size);

  try {
    const signed = await signer.modifyOrder({
      marketIndex: order.market_index,
      orderId: order.id,
      price: effectivePrice,
      size: effectiveSize,
    });

    const response = await driftClient.request('/modify', {
      method: 'POST',
      body: {
        transaction: signed.transaction,
        signature: signed.signature,
      },
    });

    await driftRepository.updateOrderStatus(orderId, {
      status: 'modified',
      exchangeResponse: response,
    });

    return { orderId, status: 'modified', response };
  } catch (error) {
    throw new ModifyFailedError('Failed to modify Drift order', {
      reason: error.message,
      orderId,
    });
  }
}

async function listUserOrders({ userId, symbol, status, page, pageSize }) {
  return driftRepository.listOrders({ userId, symbol, status, page, pageSize });
}

async function getOrder(orderId) {
  return driftRepository.findOrderById(orderId);
}

module.exports = {
  generateOrderId,
  normalizeSide,
  normalizeOrderType,
  normalizePrice,
  normalizeSize,
  assertNotional,
  resolveEffectivePrice,
  submitOrder,
  cancelOrder,
  modifyOrder,
  listUserOrders,
  getOrder,
};