'use strict';

const verifierRepository = require('../verification/verifier.repository');
const proofRepository = require('../proof.repository');
const fetcherRepository = require('../verification/fetcher.repository');

const {
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
} = require('../proof.constants');

const {
  ProofNotFoundError,
} = require('../proof.errors');

/**
 * SignalForge - Leaderboard Verified Service
 *
 * Provides on-demand verification of a specific leaderboard entry.
 * The service re-checks the underlying proofs of a provider against
 * the on-chain record and returns a verification summary that the
 * frontend uses to render the "Verified On-Chain" badge.
 */

async function verifyProvider({ providerId, window, limit = 25 } = {}) {
  if (!providerId) {
    throw new ProofNotFoundError('Provider identifier is required');
  }

  const proofs = await proofRepository.findProofsByProvider(providerId, {
    page: 1,
    pageSize: limit,
    status: PROOF_STATUSES.CONFIRMED,
  });

  if (!proofs || proofs.items.length === 0) {
    return {
      providerId,
      verified: false,
      verificationLevel: PROOF_VERIFICATION_LEVELS.UNVERIFIED,
      checkedProofs: 0,
      verifiedProofs: 0,
      brokenProofs: 0,
      lastVerifiedAt: null,
      details: [],
    };
  }

  const details = [];
  let verifiedCount = 0;
  let brokenCount = 0;
  let lastVerifiedAt = null;

  for (const proof of proofs.items) {
    if (!proof.signature) {
      details.push({
        proofId: proof.id,
        signature: null,
        status: 'missing_signature',
      });
      continue;
    }

    const verification = await verifierRepository.findBySignature(proof.signature);

    if (!verification) {
      details.push({
        proofId: proof.id,
        signature: proof.signature,
        status: 'not_verified',
      });
      continue;
    }

    if (verification.valid && verification.matches) {
      verifiedCount += 1;
      details.push({
        proofId: proof.id,
        signature: proof.signature,
        status: 'verified',
        verifiedAt: verification.created_at,
      });
      if (!lastVerifiedAt || new Date(verification.created_at) > new Date(lastVerifiedAt)) {
        lastVerifiedAt = verification.created_at;
      }
    } else {
      brokenCount += 1;
      details.push({
        proofId: proof.id,
        signature: proof.signature,
        status: 'broken',
        reason: verification.reason || 'mismatch',
      });
    }
  }

  const totalChecked = verifiedCount + brokenCount;
  const verificationLevel =
    totalChecked === 0
      ? PROOF_VERIFICATION_LEVELS.UNVERIFIED
      : brokenCount === 0
      ? PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED
      : PROOF_VERIFICATION_LEVELS.PARTIAL;

  return {
    providerId,
    window: window || null,
    verified: brokenCount === 0 && verifiedCount > 0,
    verificationLevel,
    checkedProofs: totalChecked,
    verifiedProofs: verifiedCount,
    brokenProofs: brokenCount,
    lastVerifiedAt,
    details,
  };
}

async function getVerificationBadge({ providerId } = {}) {
  if (!providerId) {
    throw new ProofNotFoundError('Provider identifier is required');
  }

  const summary = await verifierRepository.aggregateProviderVerification({ providerId });

  const total = Number(summary.total_verifications) || 0;
  const valid = Number(summary.valid_count) || 0;
  const matches = Number(summary.match_count) || 0;

  let level = PROOF_VERIFICATION_LEVELS.UNVERIFIED;
  if (matches > 0) {
    level = PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED;
  } else if (valid > 0) {
    level = PROOF_VERIFICATION_LEVELS.PARTIAL;
  }

  return {
    providerId,
    level,
    totalVerifications: total,
    validVerifications: valid,
    matchingVerifications: matches,
    lastVerifiedAt: summary.last_verified_at || null,
  };
}

async function listUnverifiedProviders({ providerIds = [] } = {}) {
  if (!Array.isArray(providerIds) || providerIds.length === 0) {
    return [];
  }

  const results = [];

  for (const providerId of providerIds) {
    const badge = await getVerificationBadge({ providerId });
    if (badge.level !== PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED) {
      results.push(badge);
    }
  }

  return results;
}

async function recheckProvider({ providerId, window } = {}) {
  const proofs = await proofRepository.findProofsByProvider(providerId, {
    page: 1,
    pageSize: 25,
    status: PROOF_STATUSES.CONFIRMED,
  });

  if (!proofs || proofs.items.length === 0) {
    return { providerId, rechecked: 0, changed: 0 };
  }

  let rechecked = 0;
  let changed = 0;

  for (const proof of proofs.items) {
    if (!proof.signature) {
      continue;
    }

    try {
      const fetched = await fetcherRepository.findBySignature(proof.signature);
      if (!fetched) {
        continue;
      }
      rechecked += 1;

      const verification = await verifierRepository.findBySignature(proof.signature);
      if (!verification || !verification.valid) {
        changed += 1;
      }
    } catch (_error) {
      // Continue on individual failure
    }
  }

  return {
    providerId,
    window: window || null,
    rechecked,
    changed,
  };
}

async function summarizeVerification({ providerId } = {}) {
  const [badge, detail] = await Promise.all([
    getVerificationBadge({ providerId }),
    verifyProvider({ providerId, limit: 10 }),
  ]);

  return {
    providerId,
    badge,
    summary: detail,
  };
}

module.exports = {
  verifyProvider,
  getVerificationBadge,
  listUnverifiedProviders,
  recheckProvider,
  summarizeVerification,
};