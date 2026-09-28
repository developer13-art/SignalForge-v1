'use strict';

const crypto = require('crypto');

const { PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');

const {
  ACTIONS_REFERENCE_KEY_MAX_LENGTH,
  ACTIONS_REFERENCE_MEMO_MAX_LENGTH,
} = require('../actions.constants');

const { InvalidParameterError } = require('../actions.errors');

/**
 * SignalForge - Reference Key Service
 *
 * Builds deterministic, unique, and traceable reference keys and memos
 * for Solana Blink transactions. The reference key is included as a
 * read-only account in the transaction so that the payment can be
 * located by the indexer. The memo carries a canonical JSON payload
 * identifying the blink and the conversion context.
 */

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

function generateReferenceKey() {
  const bytes = crypto.randomBytes(32);
  return bs58.encode(bytes);
}

function toPublicKey(referenceKey) {
  try {
    return new PublicKey(referenceKey);
  } catch (error) {
    throw new InvalidParameterError('Reference key is not a valid Solana public key', {
      referenceKey,
      reason: error.message,
    });
  }
}

function isValidReferenceKey(referenceKey) {
  if (!referenceKey || typeof referenceKey !== 'string') {
    return false;
  }
  if (referenceKey.length > ACTIONS_REFERENCE_KEY_MAX_LENGTH) {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new PublicKey(referenceKey);
    return true;
  } catch (_error) {
    return false;
  }
}

function buildReferenceMemo({ blinkId, templateType, wallet, planId, referralCode, providerId, amount, token }) {
  const payload = {
    v: 1,
    app: 'signalforge',
    kind: 'blink',
    blinkId,
    type: templateType,
  };

  if (planId) {
    payload.plan = planId;
  }
  if (referralCode) {
    payload.ref = referralCode;
  }
  if (providerId) {
    payload.provider = providerId;
  }
  if (amount !== undefined && amount !== null) {
    payload.amount = Number(amount);
  }
  if (token) {
    payload.token = token;
  }
  if (wallet) {
    payload.wallet = wallet;
  }

  const serialized = JSON.stringify(payload);

  if (serialized.length > ACTIONS_REFERENCE_MEMO_MAX_LENGTH) {
    const minimal = {
      v: 1,
      kind: 'blink',
      blinkId,
      type: templateType,
    };
    if (planId) {
      minimal.plan = planId;
    }
    if (referralCode) {
      minimal.ref = referralCode;
    }
    return JSON.stringify(minimal);
  }

  return serialized;
}

function parseReferenceMemo(memo) {
  if (!memo || typeof memo !== 'string') {
    return null;
  }
  try {
    const parsed = JSON.parse(memo);
    if (parsed && parsed.kind === 'blink') {
      return parsed;
    }
    return null;
  } catch (_error) {
    return null;
  }
}

function getMemoProgramId() {
  return MEMO_PROGRAM_ID;
}

module.exports = {
  MEMO_PROGRAM_ID,
  generateReferenceKey,
  toPublicKey,
  isValidReferenceKey,
  buildReferenceMemo,
  parseReferenceMemo,
  getMemoProgramId,
};