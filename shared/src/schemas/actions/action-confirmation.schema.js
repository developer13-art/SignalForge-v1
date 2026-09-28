'use strict';

/**
 * SignalForge - Solana Actions Confirmation Schema
 *
 * Describes the payload emitted by the backend when a Blink payment
 * is confirmed on-chain. Used by the client to update UI state after
 * a successful transaction.
 */

const ACTION_CONFIRMATION_SCHEMA = Object.freeze({
  type: 'object',
  required: ['signature', 'status'],
  properties: {
    signature: { type: 'string' },
    reference: { type: 'string' },
    blinkId: { type: 'string' },
    conversionId: { type: 'string' },
    wallet: { type: 'string' },
    amount: { type: 'number' },
    tokenSymbol: { type: 'string' },
    tokenMint: { type: 'string' },
    status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'failed', 'expired', 'cancelled'],
    },
    blockSlot: { type: 'number' },
    blockTime: { type: 'number' },
    confirmedAt: { type: 'string', format: 'date-time' },
    subscriptionId: { type: 'string' },
    errorMessage: { type: 'string' },
  },
  additionalProperties: true,
});

function validateActionConfirmation(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['confirmation must be an object'] };
  }

  if (!payload.signature || typeof payload.signature !== 'string') {
    errors.push('signature is required');
  }

  const allowedStatuses = ['pending', 'confirmed', 'failed', 'expired', 'cancelled'];
  if (!payload.status || !allowedStatuses.includes(payload.status)) {
    errors.push(`status must be one of: ${allowedStatuses.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function buildActionConfirmation({
  signature,
  reference,
  blinkId,
  conversionId,
  wallet,
  amount,
  tokenSymbol,
  tokenMint,
  status,
  blockSlot,
  blockTime,
  subscriptionId,
  errorMessage,
}) {
  return {
    signature,
    reference,
    blinkId,
    conversionId,
    wallet,
    amount,
    tokenSymbol,
    tokenMint,
    status,
    blockSlot,
    blockTime,
    confirmedAt: status === 'confirmed' ? new Date().toISOString() : null,
    subscriptionId,
    errorMessage,
  };
}

function isTerminalStatus(status) {
  return ['confirmed', 'failed', 'expired', 'cancelled'].includes(status);
}

module.exports = {
  ACTION_CONFIRMATION_SCHEMA,
  validateActionConfirmation,
  buildActionConfirmation,
  isTerminalStatus,
};