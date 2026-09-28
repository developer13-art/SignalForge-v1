'use strict';

const {
  PROOF_MEMO_VERSION,
  PROOF_KINDS,
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_SORTS,
  PROOF_MAX_BATCH_SIZE,
  PROOF_LEADERBOARD_DEFAULT_LIMIT,
  PROOF_LEADERBOARD_MAX_LIMIT,
} = require('./proof.constants');

const {
  InvalidMemoError,
  InvalidProviderError,
  InvalidTradeError,
} = require('./proof.errors');

const SIGNATURE_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/;
const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SYMBOL_PATTERN = /^[A-Z0-9/:._-]{2,32}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateProviderId(providerId) {
  if (!isNonEmptyString(providerId)) {
    throw new InvalidProviderError('Provider identifier is required');
  }
  const trimmed = providerId.trim();
  if (trimmed.length > 128) {
    throw new InvalidProviderError('Provider identifier is too long');
  }
  return trimmed;
}

function validateTradeId(tradeId) {
  if (!isNonEmptyString(tradeId)) {
    throw new InvalidTradeError('Trade identifier is required');
  }
  const trimmed = tradeId.trim();
  if (trimmed.length > 128) {
    throw new InvalidTradeError('Trade identifier is too long');
  }
  return trimmed;
}

function validateSignature(signature) {
  if (!isNonEmptyString(signature)) {
    throw new InvalidMemoError('Signature is required');
  }
  const trimmed = signature.trim();
  if (!SIGNATURE_PATTERN.test(trimmed)) {
    throw new InvalidMemoError('Signature must be a base58 transaction signature');
  }
  return trimmed;
}

function validateReference(reference) {
  if (reference === undefined || reference === null || reference === '') {
    return null;
  }
  const trimmed = String(reference).trim();
  if (!BASE58_PATTERN.test(trimmed)) {
    throw new InvalidMemoError('Reference must be a base58 Solana public key');
  }
  return trimmed;
}

function validateSymbol(symbol) {
  if (!isNonEmptyString(symbol)) {
    throw new InvalidTradeError('Symbol is required');
  }
  const normalized = symbol.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(normalized)) {
    throw new InvalidTradeError('Symbol format is invalid');
  }
  return normalized;
}

function validateProofKind(kind) {
  if (!isNonEmptyString(kind)) {
    throw new InvalidMemoError('Proof kind is required');
  }
  const normalized = kind.trim().toLowerCase();
  const allowed = Object.values(PROOF_KINDS);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported proof kind: ${normalized}`, {
      kind: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateProofStatus(status) {
  if (!isNonEmptyString(status)) {
    throw new InvalidMemoError('Proof status is required');
  }
  const normalized = status.trim().toLowerCase();
  const allowed = Object.values(PROOF_STATUSES);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported proof status: ${normalized}`, {
      status: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateVerificationLevel(level) {
  if (!isNonEmptyString(level)) {
    throw new InvalidMemoError('Verification level is required');
  }
  const normalized = level.trim().toLowerCase();
  const allowed = Object.values(PROOF_VERIFICATION_LEVELS);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported verification level: ${normalized}`, {
      level: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateMemoVersion(version) {
  const parsed = Number.parseInt(version, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    throw new InvalidMemoError('Memo version must be a positive integer');
  }
  return parsed;
}

function validateMemoPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new InvalidMemoError('Memo payload must be a JSON object');
  }

  const version = validateMemoVersion(payload.v || PROOF_MEMO_VERSION);
  const kind = validateProofKind(payload.k || payload.kind);

  const result = {
    version,
    kind,
  };

  if (kind === PROOF_KINDS.TRADE_CLOSED) {
    result.providerId = validateProviderId(payload.p || payload.providerId);
    result.tradeId = validateTradeId(payload.t || payload.tradeId);
    result.symbol = validateSymbol(payload.s || payload.symbol);

    if (payload.u !== undefined || payload.pnlUsd !== undefined) {
      const pnlUsd = Number(payload.u ?? payload.pnlUsd);
      if (!Number.isFinite(pnlUsd)) {
        throw new InvalidMemoError('pnl_usd must be a finite number');
      }
      result.pnlUsd = pnlUsd;
    }

    if (payload.r !== undefined || payload.pnlPercent !== undefined) {
      const pnlPercent = Number(payload.r ?? payload.pnlPercent);
      if (!Number.isFinite(pnlPercent)) {
        throw new InvalidMemoError('pnl_percent must be a finite number');
      }
      result.pnlPercent = pnlPercent;
    }
  } else if (kind === PROOF_KINDS.PROVIDER_CERTIFIED) {
    result.providerId = validateProviderId(payload.p || payload.providerId);
    if (payload.q !== undefined || payload.qualityScore !== undefined) {
      const qualityScore = Number(payload.q ?? payload.qualityScore);
      if (!Number.isFinite(qualityScore) || qualityScore < 0 || qualityScore > 100) {
        throw new InvalidMemoError('quality_score must be between 0 and 100');
      }
      result.qualityScore = qualityScore;
    }
  } else if (kind === PROOF_KINDS.PROVIDER_MILESTONE) {
    result.providerId = validateProviderId(payload.p || payload.providerId);
    if (!payload.m && !payload.milestoneKey) {
      throw new InvalidMemoError('milestone_key is required for milestone proofs');
    }
    result.milestoneKey = String(payload.m ?? payload.milestoneKey).trim().slice(0, 64);
  } else if (kind === PROOF_KINDS.PERFORMANCE_PERIOD) {
    result.providerId = validateProviderId(payload.p || payload.providerId);
    result.periodStart = payload.ps || payload.periodStart || null;
    result.periodEnd = payload.pe || payload.periodEnd || null;
  }

  if (payload.oa !== undefined || payload.openedAt !== undefined) {
    result.openedAt = payload.oa ?? payload.openedAt;
  }
  if (payload.ca !== undefined || payload.closedAt !== undefined) {
    result.closedAt = payload.ca ?? payload.closedAt;
  }
  if (payload.i !== undefined || payload.issuedAt !== undefined) {
    result.issuedAt = payload.i ?? payload.issuedAt;
  }

  return result;
}

function validateLeaderboardWindow(window) {
  if (!window) {
    return PROOF_LEADERBOARD_WINDOWS.MONTH;
  }
  const normalized = String(window).trim().toLowerCase();
  const allowed = Object.values(PROOF_LEADERBOARD_WINDOWS);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported leaderboard window: ${normalized}`, {
      window: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateLeaderboardSort(sortBy) {
  if (!sortBy) {
    return PROOF_LEADERBOARD_SORTS.TOTAL_PNL;
  }
  const normalized = String(sortBy).trim().toLowerCase();
  const allowed = Object.values(PROOF_LEADERBOARD_SORTS);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported leaderboard sort: ${normalized}`, {
      sortBy: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateLeaderboardLimit(limit) {
  if (limit === undefined || limit === null || limit === '') {
    return PROOF_LEADERBOARD_DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return PROOF_LEADERBOARD_DEFAULT_LIMIT;
  }
  if (parsed > PROOF_LEADERBOARD_MAX_LIMIT) {
    return PROOF_LEADERBOARD_MAX_LIMIT;
  }
  return parsed;
}

function validateBatchSize(size) {
  if (size === undefined || size === null) {
    return 1;
  }
  const parsed = Number.parseInt(size, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  if (parsed > PROOF_MAX_BATCH_SIZE) {
    return PROOF_MAX_BATCH_SIZE;
  }
  return parsed;
}

function validateDateRange({ from, to } = {}) {
  const result = { from: null, to: null };

  if (from) {
    const parsed = new Date(from);
    if (Number.isNaN(parsed.getTime())) {
      throw new InvalidMemoError('from must be a valid date');
    }
    result.from = parsed.toISOString();
  }

  if (to) {
    const parsed = new Date(to);
    if (Number.isNaN(parsed.getTime())) {
      throw new InvalidMemoError('to must be a valid date');
    }
    result.to = parsed.toISOString();
  }

  if (result.from && result.to && new Date(result.from) > new Date(result.to)) {
    throw new InvalidMemoError('from must be earlier than to');
  }

  return result;
}

module.exports = {
  isNonEmptyString,
  isPlainObject,
  validateProviderId,
  validateTradeId,
  validateSignature,
  validateReference,
  validateSymbol,
  validateProofKind,
  validateProofStatus,
  validateVerificationLevel,
  validateMemoVersion,
  validateMemoPayload,
  validateLeaderboardWindow,
  validateLeaderboardSort,
  validateLeaderboardLimit,
  validateBatchSize,
  validateDateRange,
};