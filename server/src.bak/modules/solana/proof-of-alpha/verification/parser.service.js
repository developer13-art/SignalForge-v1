'use strict';

const memoPayloadService = require('../memo/memo-payload.service');
const {
  PROOF_KINDS,
  PROOF_MEMO_PREFIX,
} = require('../proof.constants');

const {
  InvalidMemoError,
} = require('../proof.errors');

/**
 * SignalForge - Parser Service
 *
 * Parses a memo string fetched from the Solana network (or received
 * via a webhook) into a canonical Proof of Alpha payload. The parser
 * is intentionally tolerant of leading whitespace, alternate prefixes,
 * and legacy memo formats so that historical proofs remain readable.
 */

function normalizeMemoInput(input) {
  if (input === undefined || input === null) {
    return null;
  }
  if (typeof input === 'string') {
    return input.trim();
  }
  if (Buffer.isBuffer(input)) {
    return input.toString('utf8').trim();
  }
  if (Array.isArray(input)) {
    return input
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean)
      .join(' ');
  }
  return null;
}

function extractJsonSegment(memo) {
  if (!memo) {
    return null;
  }

  const prefixIndex = memo.indexOf(`${PROOF_MEMO_PREFIX}|`);
  if (prefixIndex >= 0) {
    return memo.slice(prefixIndex + PROOF_MEMO_PREFIX.length + 1);
  }

  const jsonStart = memo.indexOf('{');
  const jsonEnd = memo.lastIndexOf('}');

  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    return memo.slice(jsonStart, jsonEnd + 1);
  }

  return memo;
}

function parseJsonSegment(segment) {
  if (!segment) {
    throw new InvalidMemoError('Memo does not contain a JSON payload');
  }
  try {
    return JSON.parse(segment);
  } catch (error) {
    throw new InvalidMemoError('Unable to parse the memo JSON payload', {
      reason: error.message,
    });
  }
}

function normalizeProofKind(value) {
  if (!value) {
    return null;
  }
  const normalized = String(value).trim().toLowerCase();

  if (Object.values(PROOF_KINDS).includes(normalized)) {
    return normalized;
  }

  const aliases = {
    trade: PROOF_KINDS.TRADE_CLOSED,
    tradeclose: PROOF_KINDS.TRADE_CLOSED,
    'trade-closed': PROOF_KINDS.TRADE_CLOSED,
    certification: PROOF_KINDS.PROVIDER_CERTIFIED,
    certified: PROOF_KINDS.PROVIDER_CERTIFIED,
    'provider-certified': PROOF_KINDS.PROVIDER_CERTIFIED,
    milestone: PROOF_KINDS.PROVIDER_MILESTONE,
    'provider-milestone': PROOF_KINDS.PROVIDER_MILESTONE,
    performance: PROOF_KINDS.PERFORMANCE_PERIOD,
    'performance-period': PROOF_KINDS.PERFORMANCE_PERIOD,
  };

  return aliases[normalized] || null;
}

function parseTradeClosePayload(payload) {
  return {
    version: Number(payload.v) || 1,
    kind: PROOF_KINDS.TRADE_CLOSED,
    providerId: payload.p || payload.providerId || null,
    tradeId: payload.t || payload.tradeId || null,
    symbol: payload.s || payload.symbol || null,
    direction: payload.d || payload.direction || null,
    pnlUsd: Number(payload.u ?? payload.pnlUsd) || 0,
    pnlPercent: Number(payload.r ?? payload.pnlPercent) || 0,
    result: payload.o || payload.result || null,
    openedAt: payload.oa || payload.openedAt || null,
    closedAt: payload.ca || payload.closedAt || null,
    confidence: payload.c !== undefined ? Number(payload.c) : null,
    signalId: payload.sig || payload.signalId || null,
    issuedAt: payload.i || payload.issuedAt || null,
  };
}

function parseCertificationPayload(payload) {
  return {
    version: Number(payload.v) || 1,
    kind: PROOF_KINDS.PROVIDER_CERTIFIED,
    providerId: payload.p || payload.providerId || null,
    qualityScore: Number(payload.q ?? payload.qualityScore) || 0,
    issuedAt: payload.i || payload.issuedAt || null,
  };
}

function parseMilestonePayload(payload) {
  return {
    version: Number(payload.v) || 1,
    kind: PROOF_KINDS.PROVIDER_MILESTONE,
    providerId: payload.p || payload.providerId || null,
    milestoneKey: payload.m || payload.milestoneKey || null,
    issuedAt: payload.i || payload.issuedAt || null,
  };
}

function parsePerformancePayload(payload) {
  return {
    version: Number(payload.v) || 1,
    kind: PROOF_KINDS.PERFORMANCE_PERIOD,
    providerId: payload.p || payload.providerId || null,
    periodStart: payload.ps || payload.periodStart || null,
    periodEnd: payload.pe || payload.periodEnd || null,
    issuedAt: payload.i || payload.issuedAt || null,
  };
}

function parsePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new InvalidMemoError('Payload must be a JSON object');
  }

  const kind = normalizeProofKind(payload.k || payload.kind);
  if (!kind) {
    throw new InvalidMemoError('Memo payload does not declare a supported kind');
  }

  switch (kind) {
    case PROOF_KINDS.TRADE_CLOSED:
      return parseTradeClosePayload(payload);
    case PROOF_KINDS.PROVIDER_CERTIFIED:
      return parseCertificationPayload(payload);
    case PROOF_KINDS.PROVIDER_MILESTONE:
      return parseMilestonePayload(payload);
    case PROOF_KINDS.PERFORMANCE_PERIOD:
      return parsePerformancePayload(payload);
    default:
      throw new InvalidMemoError(`Unsupported proof kind: ${kind}`);
  }
}

function parseMemo(input) {
  const normalized = normalizeMemoInput(input);
  if (!normalized) {
    throw new InvalidMemoError('Memo is empty');
  }

  const segment = extractJsonSegment(normalized);
  const payload = parseJsonSegment(segment);
  return parsePayload(payload);
}

function tryParseMemo(input) {
  try {
    return { valid: true, parsed: parseMemo(input) };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function extractMemoPrefix(input) {
  const normalized = normalizeMemoInput(input);
  if (!normalized) {
    return null;
  }
  const prefixIndex = normalized.indexOf(`${PROOF_MEMO_PREFIX}|`);
  if (prefixIndex < 0) {
    return null;
  }
  return normalized.slice(0, prefixIndex + PROOF_MEMO_PREFIX.length);
}

function isSignalForgeMemo(input) {
  const normalized = normalizeMemoInput(input);
  if (!normalized) {
    return false;
  }
  return normalized.includes(`${PROOF_MEMO_PREFIX}|`);
}

module.exports = {
  normalizeMemoInput,
  extractJsonSegment,
  parseJsonSegment,
  normalizeProofKind,
  parseTradeClosePayload,
  parseCertificationPayload,
  parseMilestonePayload,
  parsePerformancePayload,
  parsePayload,
  parseMemo,
  tryParseMemo,
  extractMemoPrefix,
  isSignalForgeMemo,
};