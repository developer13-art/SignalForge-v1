'use strict';

/**
 * SignalForge - DEX Swap Schema
 */

const DEX_SWAP_STATUSES = Object.freeze({
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
});

const DEX_SWAP_SCHEMA = Object.freeze({
  type: 'object',
  required: ['gateway', 'inputMint', 'outputMint', 'inAmount', 'outAmount'],
  properties: {
    id: { type: 'string' },
    quoteId: { type: ['string', 'null'] },
    userId: { type: ['string', 'null'] },
    accountId: { type: ['string', 'null'] },
    gateway: { type: 'string' },
    inputMint: { type: 'string' },
    outputMint: { type: 'string' },
    inputSymbol: { type: ['string', 'null'] },
    outputSymbol: { type: ['string', 'null'] },
    inAmount: { type: 'string' },
    outAmount: { type: 'string' },
    minOutAmount: { type: ['string', 'null'] },
    slippageBps: { type: ['integer', 'null'] },
    priceImpactPct: { type: ['number', 'null'] },
    transactionSignature: { type: ['string', 'null'] },
    status: { type: 'string', enum: Object.values(DEX_SWAP_STATUSES) },
    blockSlot: { type: ['integer', 'null'] },
    blockTime: { type: ['integer', 'null'] },
    errorMessage: { type: ['string', 'null'] },
    submittedAt: { type: ['string', 'null'], format: 'date-time' },
    confirmedAt: { type: ['string', 'null'], format: 'date-time' },
  },
  additionalProperties: false,
});

function validateDexSwap(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['swap must be an object'] };
  }

  if (!payload.gateway) {
    errors.push('gateway is required');
  }
  if (!payload.inputMint) {
    errors.push('inputMint is required');
  }
  if (!payload.outputMint) {
    errors.push('outputMint is required');
  }
  if (payload.inAmount === undefined || payload.inAmount === null) {
    errors.push('inAmount is required');
  }
  if (payload.outAmount === undefined || payload.outAmount === null) {
    errors.push('outAmount is required');
  }

  if (payload.status && !Object.values(DEX_SWAP_STATUSES).includes(payload.status)) {
    errors.push('status must be a supported value');
  }

  return { valid: errors.length === 0, errors };
}

function buildDexSwap(payload) {
  return {
    id: payload.id || null,
    quoteId: payload.quoteId || null,
    userId: payload.userId || null,
    accountId: payload.accountId || null,
    gateway: payload.gateway,
    inputMint: payload.inputMint,
    outputMint: payload.outputMint,
    inputSymbol: payload.inputSymbol || null,
    outputSymbol: payload.outputSymbol || null,
    inAmount: String(payload.inAmount),
    outAmount: String(payload.outAmount),
    minOutAmount: payload.minOutAmount !== undefined ? String(payload.minOutAmount) : null,
    slippageBps: payload.slippageBps ?? null,
    priceImpactPct: payload.priceImpactPct ?? null,
    transactionSignature: payload.transactionSignature || null,
    status: payload.status || DEX_SWAP_STATUSES.PENDING,
    blockSlot: payload.blockSlot ?? null,
    blockTime: payload.blockTime ?? null,
    errorMessage: payload.errorMessage || null,
    submittedAt: payload.submittedAt || null,
    confirmedAt: payload.confirmedAt || null,
  };
}

function describeSwapSummary(swap) {
  if (!swap) {
    return null;
  }
  return {
    id: swap.id,
    gateway: swap.gateway,
    inputSymbol: swap.inputSymbol || swap.inputMint,
    outputSymbol: swap.outputSymbol || swap.outputMint,
    inAmount: swap.inAmount,
    outAmount: swap.outAmount,
    priceImpactPct: swap.priceImpactPct,
    status: swap.status,
    signature: swap.transactionSignature,
  };
}

module.exports = {
  DEX_SWAP_STATUSES,
  DEX_SWAP_SCHEMA,
  validateDexSwap,
  buildDexSwap,
  describeSwapSummary,
};