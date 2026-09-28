'use strict';

const memoSubmitter = require('./memo-submitter.service');
const memoBuilder = require('./memo-builder.service');
const memoFee = require('./memo-fee.service');
const memoRetry = require('./memo-retry.service');
const memoBatch = require('./memo-batch.service');
const memoRepository = require('./memo.repository');

const { config } = require('../proof.config');
const { PROOF_STATUSES } = require('../proof.constants');

const {
  SubmissionFailedError,
  ServiceUnavailableError,
} = require('../proof.errors');

/**
 * SignalForge - Memo Service (facade)
 *
 * The memo service is the only entry point other modules use to
 * interact with the Solana Memo program. It exposes high-level
 * operations (submit trade, certification, milestone, and performance
 * proofs) and the lower-level helpers required by the API layer and
 * the scheduler.
 */

async function ensureEnabled() {
  if (!config.enabled) {
    throw new ServiceUnavailableError('Proof of Alpha is currently disabled');
  }
  if (!memoSubmitter.isSignerConfigured()) {
    throw new ServiceUnavailableError('Proof of Alpha signer is not configured');
  }
}

async function submitTradeProof(params) {
  await ensureEnabled();
  return memoSubmitter.submitTradeProof(params);
}

async function submitCertificationProof(params) {
  await ensureEnabled();
  return memoSubmitter.submitCertificationProof(params);
}

async function submitMilestoneProof(params) {
  await ensureEnabled();
  return memoSubmitter.submitMilestoneProof(params);
}

async function submitPerformanceProof(params) {
  await ensureEnabled();
  return memoSubmitter.submitPerformanceProof(params);
}

async function retrySubmission({ submissionId, requestId }) {
  await ensureEnabled();
  return memoSubmitter.retrySubmission({ submissionId, requestId });
}

async function getSubmission(submissionId) {
  const submission = await memoRepository.findSubmissionById(submissionId);
  if (!submission) {
    throw new SubmissionFailedError('Submission was not found', { submissionId });
  }
  return submission;
}

async function getSubmissionBySignature(signature) {
  const submission = await memoRepository.findSubmissionBySignature(signature);
  if (!submission) {
    throw new SubmissionFailedError('Submission was not found', { signature });
  }
  return submission;
}

async function listSubmissionsByProvider(providerId, filters = {}) {
  return memoRepository.listSubmissionsByProvider(providerId, filters);
}

async function listPendingSubmissions(options = {}) {
  return memoRetry.listPending(options);
}

async function processPendingSubmissions(options = {}) {
  await ensureEnabled();
  return memoRetry.processPendingSubmissions(options);
}

async function retrySubmissionById({ submissionId, requestId }) {
  await ensureEnabled();
  return memoRetry.retrySubmissionById({ submissionId, requestId });
}

async function abandonSubmission({ submissionId, reason }) {
  return memoRetry.abandonSubmission({ submissionId, reason });
}

async function estimateCost({ solPriceUsd, batchSize } = {}) {
  if (batchSize && batchSize > 1) {
    return memoFee.estimateCostForBatch({ batchSize, solPriceUsd });
  }
  return memoFee.estimateCostPerMemo({ solPriceUsd });
}

async function getFeeSchedule() {
  return memoFee.getCurrentFeeSchedule();
}

async function submitTradeBatch(params) {
  await ensureEnabled();
  return memoBatch.submitTradeBatch(params);
}

async function submitCertificationBatch(params) {
  await ensureEnabled();
  return memoBatch.submitCertificationBatch(params);
}

async function submitMixedBatch(params) {
  await ensureEnabled();
  return memoBatch.submitMixedBatch(params);
}

async function retryFailedBatch(params) {
  await ensureEnabled();
  return memoBatch.retryFailedBatch(params);
}

async function listBatchStatus(params) {
  return memoBatch.listBatchStatus(params);
}

async function getAuthorityPublicKey() {
  return memoSubmitter.getAuthorityPublicKey();
}

async function isSignerConfigured() {
  return memoSubmitter.isSignerConfigured();
}

async function countSubmissionsByStatus({ providerId, status } = {}) {
  return memoRepository.countByStatus({ providerId, status });
}

async function cleanupOldSubmissions({ olderThanDays }) {
  return memoRepository.deleteOldSubmissions({ olderThanDays });
}

function buildTradeCloseMemo(params) {
  return memoBuilder.buildTradeCloseMemo(params);
}

function buildCertificationMemo(params) {
  return memoBuilder.buildCertificationMemo(params);
}

function buildMilestoneMemo(params) {
  return memoBuilder.buildMilestoneMemo(params);
}

function buildPerformanceMemo(params) {
  return memoBuilder.buildPerformanceMemo(params);
}

module.exports = {
  ensureEnabled,
  submitTradeProof,
  submitCertificationProof,
  submitMilestoneProof,
  submitPerformanceProof,
  retrySubmission,
  getSubmission,
  getSubmissionBySignature,
  listSubmissionsByProvider,
  listPendingSubmissions,
  processPendingSubmissions,
  retrySubmissionById,
  abandonSubmission,
  estimateCost,
  getFeeSchedule,
  submitTradeBatch,
  submitCertificationBatch,
  submitMixedBatch,
  retryFailedBatch,
  listBatchStatus,
  getAuthorityPublicKey,
  isSignerConfigured,
  countSubmissionsByStatus,
  cleanupOldSubmissions,
  buildTradeCloseMemo,
  buildCertificationMemo,
  buildMilestoneMemo,
  buildPerformanceMemo,
  PROOF_STATUSES,
};