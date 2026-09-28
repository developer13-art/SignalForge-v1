'use strict';

const crypto = require('crypto');

const fetcher = require('./fetcher.service');
const parser = require('./parser.service');
const matcher = require('./matcher.service');
const hashVerifier = require('./hash-verifier.service');
const verifierRepository = require('./verifier.repository');
const proofState = require('./proof-state.service');
const proofRepository = require('../proof.repository');

const { config } = require('../proof.config');
const {
  PROOF_VERIFICATION_LEVELS,
  PROOF_STATUSES,
} = require('../proof.constants');

const {
  ProofNotFoundError,
  VerificationFailedError,
  ServiceUnavailableError,
} = require('../proof.errors');

const {
  buildVerificationStartedEvent,
  buildVerificationCompletedEvent,
  buildVerificationFailedEvent,
} = require('../proof.events');

/**
 * SignalForge - Verifier Service
 *
 * Verifies a proof (or a raw memo) against the on-chain state. The
 * verifier is idempotent: repeated calls for the same signature return
 * the most recent verification record unless a fresh refresh is
 * requested. Every verification attempt is persisted so the platform
 * retains a complete audit trail.
 */

function generateVerificationId() {
  return `ver_${crypto.randomBytes(12).toString('hex')}`;
}

function emitEvent(name, payload) {
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish(name, payload);
  }
}

async function ensureEnabled() {
  if (!config.enabled) {
    throw new ServiceUnavailableError('Proof of Alpha is currently disabled');
  }
  if (!config.verification.requireOnChainMatch) {
    return;
  }
}

async function persistVerification({
  proofId,
  signature,
  providerId,
  tradeId,
  level,
  valid,
  memoHash,
  onChainHash,
  matches,
  verifier,
  reason,
  rawResponse,
}) {
  return verifierRepository.createVerification(null, {
    id: generateVerificationId(),
    proofId: proofId || null,
    signature,
    providerId: providerId || null,
    tradeId: tradeId || null,
    level: level || PROOF_VERIFICATION_LEVELS.VERIFIED,
    valid,
    memoHash: memoHash || null,
    onChainHash: onChainHash || null,
    matches,
    verifier: verifier || 'signalforge',
    reason: reason || null,
    rawResponse: rawResponse || null,
  });
}

async function verify({ signature, proof, requestId, forceRefresh = false }) {
  await ensureEnabled();

  if (!signature) {
    throw new VerificationFailedError('Signature is required');
  }

  emitEvent(
    'solana.proof.verification.started',
    buildVerificationStartedEvent({
      signature,
      providerId: proof ? proof.provider_id : null,
      requestId,
    }).payload,
  );

  const effectiveProof =
    proof || (await proofRepository.findProofBySignature(signature));

  let fetched;
  try {
    fetched = await fetcher.fetchParsed(signature, { forceRefresh });
  } catch (error) {
    if (error instanceof ProofNotFoundError) {
      const verification = await persistVerification({
        proofId: effectiveProof ? effectiveProof.id : null,
        signature,
        providerId: effectiveProof ? effectiveProof.provider_id : null,
        tradeId: effectiveProof ? effectiveProof.trade_id : null,
        level: PROOF_VERIFICATION_LEVELS.UNVERIFIED,
        valid: false,
        matches: false,
        reason: 'not_found_on_chain',
      });

      emitEvent(
        'solana.proof.verification.failed',
        buildVerificationFailedEvent({
          signature,
          providerId: effectiveProof ? effectiveProof.provider_id : null,
          reason: 'not_found_on_chain',
          requestId,
        }).payload,
      );

      return {
        signature,
        valid: false,
        matches: false,
        level: PROOF_VERIFICATION_LEVELS.UNVERIFIED,
        reason: 'not_found_on_chain',
        verification,
      };
    }

    const verification = await persistVerification({
      proofId: effectiveProof ? effectiveProof.id : null,
      signature,
      providerId: effectiveProof ? effectiveProof.provider_id : null,
      tradeId: effectiveProof ? effectiveProof.trade_id : null,
      level: PROOF_VERIFICATION_LEVELS.UNVERIFIED,
      valid: false,
      matches: false,
      reason: error.message,
    });

    emitEvent(
      'solana.proof.verification.failed',
      buildVerificationFailedEvent({
        signature,
        providerId: effectiveProof ? effectiveProof.provider_id : null,
        reason: error.message,
        requestId,
      }).payload,
    );

    throw error;
  }

  if (!fetched.memoText) {
    const verification = await persistVerification({
      proofId: effectiveProof ? effectiveProof.id : null,
      signature,
      providerId: effectiveProof ? effectiveProof.provider_id : null,
      tradeId: effectiveProof ? effectiveProof.trade_id : null,
      level: PROOF_VERIFICATION_LEVELS.PARTIAL,
      valid: false,
      matches: false,
      reason: 'memo_text_missing',
      rawResponse: fetched,
    });

    return {
      signature,
      valid: false,
      matches: false,
      level: PROOF_VERIFICATION_LEVELS.PARTIAL,
      reason: 'memo_text_missing',
      fetched,
      verification,
    };
  }

  const parsed = parser.parseMemo(fetched.memoText);

  let onChainHash = null;
  try {
    onChainHash = hashVerifier.hashPayloadCanonical(parsed);
  } catch (_error) {
    onChainHash = hashVerifier.hashRawMemo(fetched.memoText);
  }

  if (!effectiveProof) {
    const verification = await persistVerification({
      proofId: null,
      signature,
      providerId: parsed.providerId || null,
      tradeId: parsed.tradeId || null,
      level: PROOF_VERIFICATION_LEVELS.VERIFIED,
      valid: true,
      matches: true,
      memoHash: onChainHash,
      onChainHash,
      rawResponse: {
        ...fetched,
        parsed,
      },
    });

    emitEvent(
      'solana.proof.verification.completed',
      buildVerificationCompletedEvent({
        signature,
        providerId: parsed.providerId || null,
        valid: true,
        requestId,
      }).payload,
    );

    return {
      signature,
      valid: true,
      matches: true,
      level: PROOF_VERIFICATION_LEVELS.VERIFIED,
      parsed,
      memoHash: onChainHash,
      onChainHash,
      fetched,
      verification,
    };
  }

  try {
    const comparison = matcher.compareRecordWithMemo({
      proof: effectiveProof,
      memoText: fetched.memoText,
    });

    const verification = await persistVerification({
      proofId: effectiveProof.id,
      signature,
      providerId: effectiveProof.provider_id,
      tradeId: effectiveProof.trade_id,
      level: PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED,
      valid: true,
      matches: true,
      memoHash: comparison.expectedHash,
      onChainHash: comparison.actualHash,
      rawResponse: {
        ...fetched,
        parsed: comparison.parsed,
      },
    });

    emitEvent(
      'solana.proof.verification.completed',
      buildVerificationCompletedEvent({
        signature,
        providerId: effectiveProof.provider_id,
        valid: true,
        requestId,
      }).payload,
    );

    return {
      signature,
      valid: true,
      matches: true,
      level: PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED,
      proof: effectiveProof,
      parsed: comparison.parsed,
      memoHash: comparison.expectedHash,
      onChainHash: comparison.actualHash,
      fetched,
      verification,
    };
  } catch (error) {
    const verification = await persistVerification({
      proofId: effectiveProof.id,
      signature,
      providerId: effectiveProof.provider_id,
      tradeId: effectiveProof.trade_id,
      level: PROOF_VERIFICATION_LEVELS.PARTIAL,
      valid: false,
      matches: false,
      memoHash: effectiveProof.memo_hash || null,
      onChainHash,
      reason: error.message,
      rawResponse: {
        ...fetched,
        parsed,
      },
    });

    emitEvent(
      'solana.proof.verification.failed',
      buildVerificationFailedEvent({
        signature,
        providerId: effectiveProof.provider_id,
        reason: error.message,
        requestId,
      }).payload,
    );

    if (error instanceof VerificationFailedError) {
      return {
        signature,
        valid: false,
        matches: false,
        level: PROOF_VERIFICATION_LEVELS.PARTIAL,
        reason: error.message,
        details: error.details,
        fetched,
        verification,
      };
    }

    throw error;
  }
}

async function verifyRaw({ signature, requestId }) {
  return verify({ signature, proof: null, requestId });
}

async function verifyWithRefresh({ signature, requestId }) {
  const proof = await proofRepository.findProofBySignature(signature);
  return verify({ signature, proof, requestId, forceRefresh: true });
}

async function verifyMemoText({ memoText, providerId, tradeId }) {
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

  const hash = hashVerifier.hashPayloadCanonical(parsed);

  return {
    valid: true,
    parsed,
    memoHash: hash,
  };
}

async function markProofConfirmedFromVerification({ proofId, signature, blockSlot }) {
  const updated = await proofRepository.updateProofStatus(proofId, {
    status: PROOF_STATUSES.CONFIRMED,
    signature,
    blockSlot,
    confirmedAt: new Date().toISOString(),
  });

  return updated;
}

async function getVerificationsBySignature(signature) {
  return verifierRepository.listBySignature(signature);
}

async function getStateBySignature(signature) {
  return proofState.getProofStateBySignature(signature);
}

module.exports = {
  ensureEnabled,
  verify,
  verifyRaw,
  verifyWithRefresh,
  verifyMemoText,
  markProofConfirmedFromVerification,
  getVerificationsBySignature,
  getStateBySignature,
  persistVerification,
};