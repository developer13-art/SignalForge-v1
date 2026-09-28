'use strict';

const memoRepository = require('./memo.repository');
const memoSubmitter = require('./memo-submitter.service');

const { config } = require('../proof.config');
const { PROOF_MAX_RETRY_ATTEMPTS } = require('../proof.constants');

const {
  SubmissionFailedError,
} = require('../proof.errors');

/**
 * SignalForge - Memo Retry Service
 *
 * Finds submissions that are still pending or retrying and re-sends
 * them according to an exponential backoff schedule. The service is
 * invoked by the scheduler and by the API when a user manually
 * requests a retry.
 */

function resolveBackoff(attempt) {
  const schedule = config.retry.backoffMs;
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return 5000;
  }
  const index = Math.min(attempt - 1, schedule.length - 1);
  return schedule[Math.max(0, index)];
}

function shouldRetry(submission) {
  if (!submission) {
    return false;
  }
  if (submission.status === 'confirmed') {
    return false;
  }
  const maxAttempts = submission.max_attempts || PROOF_MAX_RETRY_ATTEMPTS;
  return submission.attempt < maxAttempts;
}

function isBackoffElapsed(submission) {
  if (!submission || !submission.updated_at) {
    return true;
  }
  const updatedAt = new Date(submission.updated_at).getTime();
  const elapsed = Date.now() - updatedAt;
  return elapsed >= resolveBackoff(submission.attempt);
}

async function processPendingSubmissions({ limit = 25, requestId } = {}) {
  const pending = await memoRepository.listPendingSubmissions({
    maxAttempts: config.retry.maxAttempts || PROOF_MAX_RETRY_ATTEMPTS,
    olderThanMs: 0,
    limit,
  });

  const results = [];

  for (const submission of pending) {
    if (!shouldRetry(submission)) {
      results.push({
        submissionId: submission.id,
        action: 'abandoned',
        reason: 'Maximum retry attempts reached',
      });
      continue;
    }

    if (!isBackoffElapsed(submission)) {
      results.push({
        submissionId: submission.id,
        action: 'deferred',
        nextAttemptInMs: resolveBackoff(submission.attempt) - (Date.now() - new Date(submission.updated_at).getTime()),
      });
      continue;
    }

    try {
      const result = await memoSubmitter.retrySubmission({
        submissionId: submission.id,
        requestId,
      });

      results.push({
        submissionId: submission.id,
        action: 'resubmitted',
        signature: result.signature,
        attempt: result.attempt,
      });
    } catch (error) {
      results.push({
        submissionId: submission.id,
        action: 'failed',
        reason: error.message,
      });
    }
  }

  return {
    scanned: pending.length,
    processed: results.filter((entry) => entry.action === 'resubmitted').length,
    deferred: results.filter((entry) => entry.action === 'deferred').length,
    abandoned: results.filter((entry) => entry.action === 'abandoned').length,
    failed: results.filter((entry) => entry.action === 'failed').length,
    results,
  };
}

async function retrySubmissionById({ submissionId, requestId }) {
  const submission = await memoRepository.findSubmissionById(submissionId);
  if (!submission) {
    throw new SubmissionFailedError('Submission was not found', { submissionId });
  }

  if (!shouldRetry(submission)) {
    throw new SubmissionFailedError('Submission cannot be retried', {
      submissionId,
      status: submission.status,
      attempt: submission.attempt,
      maxAttempts: submission.max_attempts,
    });
  }

  return memoSubmitter.retrySubmission({ submissionId, requestId });
}

async function listPending({ limit = 50 } = {}) {
  return memoRepository.listPendingSubmissions({
    maxAttempts: config.retry.maxAttempts || PROOF_MAX_RETRY_ATTEMPTS,
    limit,
  });
}

async function abandonSubmission({ submissionId, reason } = {}) {
  const updated = await memoRepository.updateSubmission(submissionId, {
    status: 'failed',
    errorMessage: reason || 'Abandoned after maximum retry attempts',
  });

  return updated;
}

module.exports = {
  resolveBackoff,
  shouldRetry,
  isBackoffElapsed,
  processPendingSubmissions,
  retrySubmissionById,
  listPending,
  abandonSubmission,
};