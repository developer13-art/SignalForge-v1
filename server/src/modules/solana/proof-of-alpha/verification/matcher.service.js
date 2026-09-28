'use strict';

const proofRepository = require('../proof.repository');
const parser = require('./parser.service');
const hashVerifier = require('./hash-verifier.service');

const {
  PROOF_KINDS,
} = require('../proof.constants');

const {
  VerificationFailedError,
  ProofNotFoundError,
  InvalidMemoError,
} = require('../proof.errors');

/**
 * SignalForge - Matcher Service
 *
 * Compares a proof record stored in PostgreSQL with the memo observed
 * on-chain. The matcher is the single source of truth for determining
 * whether a proof is "on-chain confirmed". Any mismatch triggers an
 * explicit VerificationFailedError so callers do not accidentally
 * accept a mutated memo.
 */

function assertRequired(value, label) {
  if (value === undefined || value === null || value === '') {
    throw new InvalidMemoError(`${label} is required for matching`);
  }
  return value;
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value);
}

function matchTradeClose({ proof, parsed }) {
  const errors = [];

  if (normalizeString(proof.provider_id) !== normalizeString(parsed.providerId)) {
    errors.push({
      field: 'provider_id',
      expected: proof.provider_id,
      actual: parsed.providerId,
    });
  }

  if (normalizeString(proof.trade_id) !== normalizeString(parsed.tradeId)) {
    errors.push({
      field: 'trade_id',
      expected: proof.trade_id,
      actual: parsed.tradeId,
    });
  }

  const proofPayload = proof.memo_payload || {};
  const expectedSymbol = normalizeString(proofPayload.s || proofPayload.symbol);
  const expectedDirection = normalizeString(proofPayload.d || proofPayload.direction);

  if (expectedSymbol && expectedSymbol !== normalizeString(parsed.symbol)) {
    errors.push({
      field: 'symbol',
      expected: expectedSymbol,
      actual: parsed.symbol,
    });
  }

  if (expectedDirection && expectedDirection !== normalizeString(parsed.direction)) {
    errors.push({
      field: 'direction',
      expected: expectedDirection,
      actual: parsed.direction,
    });
  }

  const expectedPnlPercent = Number(proofPayload.r ?? proofPayload.pnlPercent);
  if (Number.isFinite(expectedPnlPercent) && expectedPnlPercent !== parsed.pnlPercent) {
    errors.push({
      field: 'pnl_percent',
      expected: expectedPnlPercent,
      actual: parsed.pnlPercent,
    });
  }

  const expectedPnlUsd = Number(proofPayload.u ?? proofPayload.pnlUsd);
  if (Number.isFinite(expectedPnlUsd) && expectedPnlUsd !== parsed.pnlUsd) {
    errors.push({
      field: 'pnl_usd',
      expected: expectedPnlUsd,
      actual: parsed.pnlUsd,
    });
  }

  return errors;
}

function matchCertification({ proof, parsed }) {
  const errors = [];

  if (normalizeString(proof.provider_id) !== normalizeString(parsed.providerId)) {
    errors.push({
      field: 'provider_id',
      expected: proof.provider_id,
      actual: parsed.providerId,
    });
  }

  const expectedScore = Number(proof.memo_payload?.q ?? proof.memo_payload?.qualityScore);
  if (Number.isFinite(expectedScore) && expectedScore !== parsed.qualityScore) {
    errors.push({
      field: 'quality_score',
      expected: expectedScore,
      actual: parsed.qualityScore,
    });
  }

  return errors;
}

function matchMilestone({ proof, parsed }) {
  const errors = [];

  if (normalizeString(proof.provider_id) !== normalizeString(parsed.providerId)) {
    errors.push({
      field: 'provider_id',
      expected: proof.provider_id,
      actual: parsed.providerId,
    });
  }

  const expectedKey = normalizeString(proof.memo_payload?.m || proof.memo_payload?.milestoneKey);
  if (expectedKey && expectedKey !== normalizeString(parsed.milestoneKey)) {
    errors.push({
      field: 'milestone_key',
      expected: expectedKey,
      actual: parsed.milestoneKey,
    });
  }

  return errors;
}

function matchPerformance({ proof, parsed }) {
  const errors = [];

  if (normalizeString(proof.provider_id) !== normalizeString(parsed.providerId)) {
    errors.push({
      field: 'provider_id',
      expected: proof.provider_id,
      actual: parsed.providerId,
    });
  }

  return errors;
}

function dispatchMatch({ proof, parsed }) {
  const kind = parsed.kind || proof.kind;

  switch (kind) {
    case PROOF_KINDS.TRADE_CLOSED:
      return matchTradeClose({ proof, parsed });
    case PROOF_KINDS.PROVIDER_CERTIFIED:
      return matchCertification({ proof, parsed });
    case PROOF_KINDS.PROVIDER_MILESTONE:
      return matchMilestone({ proof, parsed });
    case PROOF_KINDS.PERFORMANCE_PERIOD:
      return matchPerformance({ proof, parsed });
    default:
      throw new InvalidMemoError(`Unsupported proof kind for matching: ${kind}`);
  }
}

function compareRecordWithMemo({ proof, memoText }) {
  assertRequired(proof, 'Proof record');
  assertRequired(memoText, 'Memo text');

  const parsed = parser.parseMemo(memoText);

  const fieldErrors = dispatchMatch({ proof, parsed });

  const expectedHash = proof.memo_hash || null;
  const actualHash = hashVerifier.hashPayloadCanonical(parsed);

  const hashMatches = expectedHash
    ? hashVerifier.compareHashes(expectedHash, actualHash)
    : true;

  const matches = fieldErrors.length === 0 && hashMatches;

  if (!matches) {
    throw new VerificationFailedError('On-chain memo does not match the recorded proof', {
      fieldErrors,
      expectedHash,
      actualHash,
      hashMatches,
    });
  }

  return {
    valid: true,
    matches: true,
    parsed,
    fieldErrors,
    expectedHash,
    actualHash,
    hashMatches,
  };
}

async function matchProofBySignature({ signature, memoText }) {
  const proof = await proofRepository.findProofBySignature(signature);

  if (!proof) {
    throw new ProofNotFoundError(
      'No proof record matches the provided signature',
      { signature },
    );
  }

  if (!memoText) {
    return {
      valid: false,
      matches: false,
      proof,
      reason: 'memo_text_missing',
    };
  }

  const comparison = compareRecordWithMemo({ proof, memoText });

  return {
    valid: true,
    matches: true,
    proof,
    ...comparison,
  };
}

async function matchRawMemo({ memoText, providerId, tradeId }) {
  const parsed = parser.parseMemo(memoText);

  if (providerId && parsed.providerId !== providerId) {
    throw new VerificationFailedError('Memo provider does not match the requested provider', {
      expected: providerId,
      actual: parsed.providerId,
    });
  }

  if (tradeId && parsed.tradeId !== tradeId) {
    throw new VerificationFailedError('Memo trade does not match the requested trade', {
      expected: tradeId,
      actual: parsed.tradeId,
    });
  }

  return { valid: true, matches: true, parsed };
}

module.exports = {
  compareRecordWithMemo,
  matchProofBySignature,
  matchRawMemo,
  dispatchMatch,
};