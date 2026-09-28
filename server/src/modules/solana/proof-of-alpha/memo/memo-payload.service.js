'use strict';

const {
  PROOF_MEMO_VERSION,
  PROOF_MEMO_PREFIX,
  PROOF_KINDS,
  PROOF_RESULT_VALUES,
  PROOF_MAX_MEMO_BYTES,
} = require('../proof.constants');

const {
  InvalidMemoError,
  MemoTooLargeError,
} = require('../proof.errors');

/**
 * SignalForge - Memo Payload Service
 *
 * Builds and parses the canonical JSON payload written to the Solana
 * Memo program for every Proof of Alpha record. The payload is
 * intentionally compact (short keys, no whitespace) so that it fits
 * within the program's byte limit and remains human-readable when
 * inspected on a block explorer.
 */

function toUnixSeconds(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    if (value > 1e12) {
      return Math.floor(value / 1000);
    }
    return Math.floor(value);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return Math.floor(parsed.getTime() / 1000);
}

function resolveResult(pnlPercent, pnlUsd) {
  const numeric = Number(pnlPercent);
  if (Number.isFinite(numeric)) {
    if (numeric > 0) {
      return PROOF_RESULT_VALUES.WIN;
    }
    if (numeric < 0) {
      return PROOF_RESULT_VALUES.LOSS;
    }
    return PROOF_RESULT_VALUES.BREAK_EVEN;
  }
  const numericUsd = Number(pnlUsd);
  if (Number.isFinite(numericUsd)) {
    if (numericUsd > 0) {
      return PROOF_RESULT_VALUES.WIN;
    }
    if (numericUsd < 0) {
      return PROOF_RESULT_VALUES.LOSS;
    }
    return PROOF_RESULT_VALUES.BREAK_EVEN;
  }
  return PROOF_RESULT_VALUES.BREAK_EVEN;
}

function round(value, decimals = 4) {
  if (!Number.isFinite(value)) {
    return null;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function truncate(value, maxLength) {
  if (value === undefined || value === null) {
    return null;
  }
  const str = String(value);
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength);
}

function buildTradeClosePayload({
  providerId,
  tradeId,
  symbol,
  direction,
  pnlUsd,
  pnlPercent,
  openedAt,
  closedAt,
  confidence,
  signalId,
  issuedAt,
}) {
  const payload = {
    v: PROOF_MEMO_VERSION,
    k: PROOF_KINDS.TRADE_CLOSED,
    p: truncate(providerId, 64),
    t: truncate(tradeId, 64),
    s: truncate(symbol, 24),
    d: truncate(direction, 8),
    u: round(Number(pnlUsd) || 0, 4),
    r: round(Number(pnlPercent) || 0, 4),
    o: resolveResult(pnlPercent, pnlUsd),
  };

  const oa = toUnixSeconds(openedAt);
  if (oa) {
    payload.oa = oa;
  }

  const ca = toUnixSeconds(closedAt);
  if (ca) {
    payload.ca = ca;
  }

  if (confidence !== undefined && confidence !== null) {
    payload.c = round(Number(confidence) || 0, 4);
  }

  if (signalId) {
    payload.sig = truncate(signalId, 48);
  }

  payload.i = toUnixSeconds(issuedAt) || Math.floor(Date.now() / 1000);

  return payload;
}

function buildCertificationPayload({ providerId, qualityScore, issuedAt }) {
  return {
    v: PROOF_MEMO_VERSION,
    k: PROOF_KINDS.PROVIDER_CERTIFIED,
    p: truncate(providerId, 64),
    q: round(Number(qualityScore) || 0, 2),
    i: toUnixSeconds(issuedAt) || Math.floor(Date.now() / 1000),
  };
}

function buildMilestonePayload({ providerId, milestoneKey, issuedAt }) {
  return {
    v: PROOF_MEMO_VERSION,
    k: PROOF_KINDS.PROVIDER_MILESTONE,
    p: truncate(providerId, 64),
    m: truncate(milestoneKey, 64),
    i: toUnixSeconds(issuedAt) || Math.floor(Date.now() / 1000),
  };
}

function buildPerformancePayload({ providerId, periodStart, periodEnd, issuedAt }) {
  return {
    v: PROOF_MEMO_VERSION,
    k: PROOF_KINDS.PERFORMANCE_PERIOD,
    p: truncate(providerId, 64),
    ps: toUnixSeconds(periodStart),
    pe: toUnixSeconds(periodEnd),
    i: toUnixSeconds(issuedAt) || Math.floor(Date.now() / 1000),
  };
}

function serializePayload(payload) {
  const json = JSON.stringify(payload);
  const buffer = Buffer.from(json, 'utf8');

  if (buffer.length > PROOF_MAX_MEMO_BYTES) {
    throw new MemoTooLargeError(
      `Memo payload exceeds the maximum allowed size of ${PROOF_MAX_MEMO_BYTES} bytes`,
      { bytes: buffer.length, max: PROOF_MAX_MEMO_BYTES },
    );
  }

  return json;
}

function buildMemoString(payload) {
  const json = serializePayload(payload);
  return `${PROOF_MEMO_PREFIX}|${json}`;
}

function parseMemoString(memo) {
  if (!memo || typeof memo !== 'string') {
    throw new InvalidMemoError('Memo string is required');
  }

  const trimmed = memo.trim();
  const prefixIndex = trimmed.indexOf(`${PROOF_MEMO_PREFIX}|`);

  const jsonPart =
    prefixIndex >= 0
      ? trimmed.slice(prefixIndex + PROOF_MEMO_PREFIX.length + 1)
      : trimmed;

  try {
    return JSON.parse(jsonPart);
  } catch (error) {
    throw new InvalidMemoError('Unable to parse the memo payload', {
      reason: error.message,
    });
  }
}

function serializeCompact(payload) {
  return JSON.stringify(payload);
}

function hashPayload(payload) {
  const crypto = require('crypto');
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(json, 'utf8').digest('hex');
}

module.exports = {
  buildTradeClosePayload,
  buildCertificationPayload,
  buildMilestonePayload,
  buildPerformancePayload,
  serializePayload,
  buildMemoString,
  parseMemoString,
  serializeCompact,
  hashPayload,
  toUnixSeconds,
  resolveResult,
};