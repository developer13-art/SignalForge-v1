'use strict';

/**
 * Crypto Trading Service
 *
 * Business logic layer for crypto positions, orders, history, and
 * settings. This is a skeleton: each method delegates to the
 * repository and returns the same shape the controller expects.
 *
 * @module signalforge/server/modules/crypto-trading/service
 */

const repository = require('./crypto-trading.repository');

async function listPositions(userId, filters = {}) {
  return repository.listPositions({ userId, ...filters });
}

async function getPosition(userId, positionId) {
  const position = await repository.findPositionById({ userId, positionId });
  if (!position) {
    return null;
  }
  return position;
}

async function closePosition(userId, positionId, payload = {}) {
  void payload;
  return {
    positionId,
    userId,
    status: 'close_requested',
    requestedAt: new Date().toISOString(),
  };
}

async function listOrders(userId, filters = {}) {
  return repository.listOrders({ userId, ...filters });
}

async function getOrder(userId, orderId) {
  return repository.findOrderById({ userId, orderId });
}

async function cancelOrder(userId, orderId) {
  return {
    orderId,
    userId,
    status: 'cancel_requested',
    requestedAt: new Date().toISOString(),
  };
}

async function listHistory(userId, filters = {}) {
  return repository.listHistory({ userId, ...filters });
}

async function listSwaps(userId, filters = {}) {
  return repository.listSwaps({ userId, ...filters });
}

async function quoteSwap(userId, payload = {}) {
  return {
    userId,
    quoteId: null,
    inputMint: payload.inputMint || null,
    outputMint: payload.outputMint || null,
    inAmount: payload.amount || null,
    outAmount: null,
    slippageBps: payload.slippageBps || 50,
    priceImpactPct: 0,
    status: 'not_available',
    message: 'Swap quoting will be enabled once gateway configuration is complete.',
  };
}

async function buildSwap(userId, payload = {}) {
  return {
    userId,
    quoteId: payload.quoteId || null,
    status: 'not_available',
    message: 'Swap building will be enabled once gateway configuration is complete.',
  };
}

async function submitSwap(userId, payload = {}) {
  return {
    userId,
    swapId: payload.swapId || null,
    signature: payload.signature || null,
    status: 'not_available',
    message: 'Swap submission will be enabled once gateway configuration is complete.',
  };
}

async function confirmSwap(userId, payload = {}) {
  return {
    userId,
    swapId: payload.swapId || null,
    status: 'not_available',
    message: 'Swap confirmation will be enabled once gateway configuration is complete.',
  };
}

async function getTradingWallet(userId) {
  const wallet = await repository.findWalletByUserId(userId);
  return wallet || { userId, address: null };
}

async function registerTradingWallet(userId, payload = {}) {
  if (!payload.address) {
    const error = new Error('Wallet address is required');
    error.code = 'CRYPTO_INVALID_REQUEST';
    error.statusCode = 400;
    throw error;
  }
  return repository.upsertWallet({
    userId,
    address: payload.address,
    chain: payload.chain || 'solana',
  });
}

async function unregisterTradingWallet(userId) {
  return repository.deleteWallet(userId);
}

async function getRiskSettings(userId) {
  const settings = await repository.findRiskSettings(userId);
  return settings || { userId, settings: {} };
}

async function updateRiskSettings(userId, settings = {}) {
  return repository.upsertRiskSettings({ userId, settings });
}

async function getAutomation(userId) {
  const rules = await repository.findAutomation(userId);
  return rules || { userId, rules: [] };
}

async function updateAutomation(userId, rules = []) {
  return repository.upsertAutomation({ userId, rules });
}

module.exports = {
  listPositions,
  getPosition,
  closePosition,
  listOrders,
  getOrder,
  cancelOrder,
  listHistory,
  listSwaps,
  quoteSwap,
  buildSwap,
  submitSwap,
  confirmSwap,
  getTradingWallet,
  registerTradingWallet,
  unregisterTradingWallet,
  getRiskSettings,
  updateRiskSettings,
  getAutomation,
  updateAutomation,
};