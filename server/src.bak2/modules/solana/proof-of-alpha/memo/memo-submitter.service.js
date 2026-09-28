'use strict';

const memoBuilder = require('./memo-builder.service');
const memoSigner = require('./memo-signer.service');
const memoRepository = require('./memo.repository');

const { PublicKey } = require('@solana/web3.js');

const { config } = require('../proof.config');
const {
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
} = require('../proof.constants');

const {
  SubmissionFailedError,
  RpcUnavailableError,
} = require('../proof.errors');

const {
  buildMemoSubmittedEvent,
  buildMemoFailedEvent,
} = require('../proof.events');

/**
 * SignalForge - Memo Submitter Service
 *
 * Sends signed memo transactions to the Solana network and records
 * each attempt in the submissions table. The submitter does not wait
 * for confirmation; confirmation is handled by the confirmation
 * service and the reconciler.
 */

function emitEvent(name, payload) {
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish(name, payload);
  }
}

function generateSubmissionId() {
  const crypto = require('crypto');
  return `sub_${crypto.randomBytes(12).toString('hex')}`;
}

function generateReferenceKey() {
  const crypto = require('crypto');
  const bs58 = require('bs58');
  return bs58.encode(crypto.randomBytes(32));
}

async function sendAndConfirmRaw(signedTransaction, { skipPreflight = false } = {}) {
  const connection = memoBuilder.getConnection();

  try {
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight,
      preflightCommitment: config.commitment || 'confirmed',
      maxRetries: 3,
    });
    return signature;
  } catch (error) {
    throw new RpcUnavailableError('Failed to send memo transaction', {
      reason: error.message,
    });
  }
}

async function submitMemo({
  proofId,
  providerId,
  tradeId,
  kind,
  memoPayload,
  memoString,
  memoHash,
  requestId,
  attempt = 1,
}) {
  const submissionId = generateSubmissionId();
  const reference = generateReferenceKey();

  const submission = await memoRepository.createSubmission(null, {
    id: submissionId,
    proofId,
    providerId,
    tradeId,
    kind,
    memoPayload,
    memoString,
    memoHash,
    memoBytes: Buffer.byteLength(memoString, 'utf8'),
    status: 'pending',
    attempt,
    maxAttempts: config.retry.maxAttempts,
    reference,
  });

  try {
    const built = await memoBuilder.buildAndSignMemoTransaction({ memoString });
    const signerPublicKey = memoSigner.getPublicKeyString();

    const signature = await sendAndConfirmRaw(built.serialized);

    const updated = await memoRepository.updateSubmission(submissionId, {
      status: PROOF_STATUSES.SUBMITTED,
      signature,
      submittedAt: new Date().toISOString(),
      attempt,
    });

    emitEvent(
      'solana.proof.memo.submitted',
      buildMemoSubmittedEvent({
        providerId,
        tradeId,
        signature,
        reference,
        requestId,
      }).payload,
    );

    return {
      submission: updated,
      signature,
      reference,
      signer: signerPublicKey,
      attempt,
      status: PROOF_STATUSES.SUBMITTED,
      verificationLevel: PROOF_VERIFICATION_LEVELS.PARTIAL,
    };
  } catch (error) {
    const message = error.message || 'Unknown submission failure';

    await memoRepository.updateSubmission(submissionId, {
      status: 'retrying',
      errorMessage: message,
      attempt,
    });

    emitEvent(
      'solana.proof.memo.failed',
      buildMemoFailedEvent({
        providerId,
        tradeId,
        signature: null,
        reason: message,
        requestId,
      }).payload,
    );

    throw new SubmissionFailedError('Failed to submit the memo transaction', {
      reason: message,
      submissionId,
    });
  }
}

async function submitTradeProof({
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
  requestId,
}) {
  const built = memoBuilder.buildTradeCloseMemo({
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
  });

  return submitMemo({
    providerId,
    tradeId,
    kind: 'trade_closed',
    memoPayload: built.payload,
    memoString: built.memoString,
    memoHash: built.memoHash,
    requestId,
  });
}

async function submitCertificationProof({ providerId, qualityScore, requestId }) {
  const built = memoBuilder.buildCertificationMemo({ providerId, qualityScore });

  return submitMemo({
    providerId,
    kind: 'provider_certified',
    memoPayload: built.payload,
    memoString: built.memoString,
    memoHash: built.memoHash,
    requestId,
  });
}

async function submitMilestoneProof({ providerId, milestoneKey, requestId }) {
  const built = memoBuilder.buildMilestoneMemo({ providerId, milestoneKey });

  return submitMemo({
    providerId,
    kind: 'provider_milestone',
    memoPayload: built.payload,
    memoString: built.memoString,
    memoHash: built.memoHash,
    requestId,
  });
}

async function submitPerformanceProof({ providerId, periodStart, periodEnd, requestId }) {
  const built = memoBuilder.buildPerformanceMemo({ providerId, periodStart, periodEnd });

  return submitMemo({
    providerId,
    kind: 'performance_period',
    memoPayload: built.payload,
    memoString: built.memoString,
    memoHash: built.memoHash,
    requestId,
  });
}

async function retrySubmission({ submissionId, requestId }) {
  const submission = await memoRepository.findSubmissionById(submissionId);
  if (!submission) {
    throw new SubmissionFailedError('Submission was not found', { submissionId });
  }

  if (submission.attempt >= submission.max_attempts) {
    throw new SubmissionFailedError('Maximum retry attempts reached', {
      submissionId,
      attempts: submission.attempt,
    });
  }

  return submitMemo({
    proofId: submission.proof_id,
    providerId: submission.provider_id,
    tradeId: submission.trade_id,
    kind: submission.kind,
    memoPayload: submission.memo_payload,
    memoString: submission.memo_string,
    memoHash: submission.memo_hash,
    requestId,
    attempt: submission.attempt + 1,
  });
}

function isSignerConfigured() {
  return memoSigner.isConfigured();
}

function getAuthorityPublicKey() {
  return memoSigner.getPublicKeyString();
}

module.exports = {
  submitMemo,
  submitTradeProof,
  submitCertificationProof,
  submitMilestoneProof,
  submitPerformanceProof,
  retrySubmission,
  isSignerConfigured,
  getAuthorityPublicKey,
  sendAndConfirmRaw,
  generateReferenceKey,
};