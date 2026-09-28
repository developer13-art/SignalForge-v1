'use strict';

const proofRepository = require('../proof.repository');
const verifierRepository = require('./verifier.repository');
const memoRepository = require('../memo/memo.repository');

const {
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
} = require('../proof.constants');

const {
  ProofNotFoundError,
} = require('../proof.errors');

/**
 * SignalForge - Proof State Service
 *
 * Derives the current lifecycle state of a proof by reconciling the
 * proof record, its memo submissions, and its verification history.
 * This service is the single source of truth for "what is the actual
 * state of this proof right now?".
 */

function deriveState({ proof, submissions, verifications }) {
  if (!proof) {
    return {
      status: 'missing',
      verificationLevel: PROOF_VERIFICATION_LEVELS.UNVERIFIED,
      hasOnChainEvidence: false,
      lastVerificationAt: null,
      attempts: 0,
      confirmed: false,
    };
  }

  const latestSubmission = Array.isArray(submissions) && submissions.length > 0
    ? submissions[submissions.length - 1]
    : null;

  const successfulSubmission = Array.isArray(submissions)
    ? submissions.find((entry) => entry.status === 'confirmed' || entry.status === 'submitted')
    : null;

  const lastVerification = Array.isArray(verifications) && verifications.length > 0
    ? verifications[0]
    : null;

  const hasOnChainEvidence =
    proof.status === PROOF_STATUSES.CONFIRMED ||
    Boolean(successfulSubmission && successfulSubmission.signature);

  let verificationLevel = PROOF_VERIFICATION_LEVELS.UNVERIFIED;

  if (lastVerification && lastVerification.valid) {
    if (lastVerification.matches) {
      verificationLevel = PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED;
    } else {
      verificationLevel = PROOF_VERIFICATION_LEVELS.PARTIAL;
    }
  } else if (hasOnChainEvidence) {
    verificationLevel = PROOF_VERIFICATION_LEVELS.PARTIAL;
  }

  return {
    status: proof.status || 'unknown',
    verificationLevel,
    hasOnChainEvidence,
    lastVerificationAt: lastVerification ? lastVerification.created_at : null,
    attempts: latestSubmission ? latestSubmission.attempt : 0,
    confirmed: proof.status === PROOF_STATUSES.CONFIRMED,
    signature: proof.signature || (successfulSubmission ? successfulSubmission.signature : null),
    submissionId: latestSubmission ? latestSubmission.id : null,
  };
}

async function getProofState(proofId) {
  const proof = await proofRepository.findProofById(proofId);
  if (!proof) {
    throw new ProofNotFoundError(`Proof ${proofId} was not found`);
  }

  const [submissions, verifications] = await Promise.all([
    proof.signature
      ? memoRepository.findSubmissionsByProof(proofId)
      : memoRepository.findSubmissionsByProof(proofId),
    proof.signature
      ? verifierRepository.listBySignature(proof.signature)
      : Promise.resolve([]),
  ]);

  return deriveState({ proof, submissions, verifications });
}

async function getProofStateBySignature(signature) {
  const proof = await proofRepository.findProofBySignature(signature);
  if (!proof) {
    throw new ProofNotFoundError('No proof record matches the provided signature', { signature });
  }

  const [submissions, verifications] = await Promise.all([
    memoRepository.findSubmissionsByProof(proof.id),
    verifierRepository.listBySignature(signature),
  ]);

  return deriveState({ proof, submissions, verifications });
}

async function getBatchState(proofIds) {
  if (!Array.isArray(proofIds) || proofIds.length === 0) {
    return [];
  }

  const results = [];

  for (const proofId of proofIds) {
    try {
      const state = await getProofState(proofId);
      results.push({ proofId, state });
    } catch (error) {
      results.push({ proofId, error: error.message });
    }
  }

  return results;
}

function isFinalStatus(status) {
  return [PROOF_STATUSES.CONFIRMED, PROOF_STATUSES.FAILED, PROOF_STATUSES.EXPIRED].includes(status);
}

function isPendingStatus(status) {
  return [PROOF_STATUSES.PENDING, PROOF_STATUSES.SUBMITTING, PROOF_STATUSES.SUBMITTED].includes(
    status,
  );
}

module.exports = {
  deriveState,
  getProofState,
  getProofStateBySignature,
  getBatchState,
  isFinalStatus,
  isPendingStatus,
};