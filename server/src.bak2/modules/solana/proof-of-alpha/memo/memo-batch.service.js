'use strict';

const memoSubmitter = require('./memo-submitter.service');
const memoBuilder = require('./memo-builder.service');
const memoRepository = require('./memo.repository');

const { config } = require('../proof.config');
const {
  PROOF_MAX_BATCH_SIZE,
  PROOF_STATUSES,
} = require('../proof.constants');

const {
  SubmissionFailedError,
  InvalidMemoError,
} = require('../proof.errors');

/**
 * SignalForge - Memo Batch Service
 *
 * Submits multiple memo transactions for a single provider in a
 * controlled batch. Batching is bounded to avoid overwhelming the
 * RPC endpoint and to keep the per-provider rate limit meaningful.
 */

function normalizeBatch(items) {
  if (!Array.isArray(items)) {
    throw new InvalidMemoError('Batch payload must be an array');
  }
  if (items.length === 0) {
    throw new InvalidMemoError('Batch must contain at least one memo');
  }
  if (items.length > PROOF_MAX_BATCH_SIZE) {
    throw new InvalidMemoError(
      `Batch size must not exceed ${PROOF_MAX_BATCH_SIZE} memos`,
      { size: items.length, max: PROOF_MAX_BATCH_SIZE },
    );
  }
  return items;
}

async function submitTradeBatch({ providerId, trades, requestId }) {
  const batch = normalizeBatch(trades);

  const results = [];

  for (const trade of batch) {
    try {
      const built = memoBuilder.buildTradeCloseMemo({
        providerId,
        tradeId: trade.tradeId,
        symbol: trade.symbol,
        direction: trade.direction,
        pnlUsd: trade.pnlUsd,
        pnlPercent: trade.pnlPercent,
        openedAt: trade.openedAt,
        closedAt: trade.closedAt,
        confidence: trade.confidence,
        signalId: trade.signalId,
      });

      const result = await memoSubmitter.submitMemo({
        providerId,
        tradeId: trade.tradeId,
        kind: 'trade_closed',
        memoPayload: built.payload,
        memoString: built.memoString,
        memoHash: built.memoHash,
        requestId,
      });

      results.push({
        tradeId: trade.tradeId,
        success: true,
        signature: result.signature,
        submissionId: result.submission?.id || null,
      });
    } catch (error) {
      results.push({
        tradeId: trade.tradeId,
        success: false,
        error: error.message,
      });
    }
  }

  const succeeded = results.filter((entry) => entry.success).length;
  const failed = results.length - succeeded;

  return {
    providerId,
    total: results.length,
    succeeded,
    failed,
    results,
  };
}

async function submitCertificationBatch({ providerId, certifications, requestId }) {
  const batch = normalizeBatch(certifications);

  const results = [];

  for (const entry of batch) {
    try {
      const built = memoBuilder.buildCertificationMemo({
        providerId,
        qualityScore: entry.qualityScore,
      });

      const result = await memoSubmitter.submitMemo({
        providerId,
        kind: 'provider_certified',
        memoPayload: built.payload,
        memoString: built.memoString,
        memoHash: built.memoHash,
        requestId,
      });

      results.push({
        qualityScore: entry.qualityScore,
        success: true,
        signature: result.signature,
        submissionId: result.submission?.id || null,
      });
    } catch (error) {
      results.push({
        qualityScore: entry.qualityScore,
        success: false,
        error: error.message,
      });
    }
  }

  const succeeded = results.filter((item) => item.success).length;
  const failed = results.length - succeeded;

  return {
    providerId,
    total: results.length,
    succeeded,
    failed,
    results,
  };
}

async function submitMixedBatch({ items, requestId }) {
  const batch = normalizeBatch(items);

  const results = [];

  for (const item of batch) {
    try {
      let built;
      if (item.kind === 'trade_closed') {
        built = memoBuilder.buildTradeCloseMemo({
          providerId: item.providerId,
          tradeId: item.tradeId,
          symbol: item.symbol,
          direction: item.direction,
          pnlUsd: item.pnlUsd,
          pnlPercent: item.pnlPercent,
          openedAt: item.openedAt,
          closedAt: item.closedAt,
          confidence: item.confidence,
          signalId: item.signalId,
        });
      } else if (item.kind === 'provider_certified') {
        built = memoBuilder.buildCertificationMemo({
          providerId: item.providerId,
          qualityScore: item.qualityScore,
        });
      } else if (item.kind === 'provider_milestone') {
        built = memoBuilder.buildMilestoneMemo({
          providerId: item.providerId,
          milestoneKey: item.milestoneKey,
        });
      } else if (item.kind === 'performance_period') {
        built = memoBuilder.buildPerformanceMemo({
          providerId: item.providerId,
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
        });
      } else {
        throw new InvalidMemoError(`Unsupported batch item kind: ${item.kind}`);
      }

      const result = await memoSubmitter.submitMemo({
        providerId: item.providerId,
        tradeId: item.tradeId || null,
        kind: item.kind,
        memoPayload: built.payload,
        memoString: built.memoString,
        memoHash: built.memoHash,
        requestId,
      });

      results.push({
        kind: item.kind,
        reference: item.tradeId || item.milestoneKey || null,
        success: true,
        signature: result.signature,
        submissionId: result.submission?.id || null,
      });
    } catch (error) {
      results.push({
        kind: item.kind,
        reference: item.tradeId || item.milestoneKey || null,
        success: false,
        error: error.message,
      });
    }
  }

  const succeeded = results.filter((entry) => entry.success).length;
  const failed = results.length - succeeded;

  return {
    total: results.length,
    succeeded,
    failed,
    results,
  };
}

async function retryFailedBatch({ submissionIds, requestId }) {
  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    throw new InvalidMemoError('submissionIds must be a non-empty array');
  }

  const results = [];

  for (const submissionId of submissionIds) {
    try {
      const result = await memoSubmitter.retrySubmission({ submissionId, requestId });
      results.push({
        submissionId,
        success: true,
        signature: result.signature,
      });
    } catch (error) {
      results.push({
        submissionId,
        success: false,
        error: error.message,
      });
    }
  }

  const succeeded = results.filter((entry) => entry.success).length;
  const failed = results.length - succeeded;

  return {
    total: results.length,
    succeeded,
    failed,
    results,
  };
}

async function listBatchStatus({ submissionIds } = {}) {
  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    return [];
  }

  const records = [];
  for (const id of submissionIds) {
    const submission = await memoRepository.findSubmissionById(id);
    if (submission) {
      records.push({
        id: submission.id,
        status: submission.status,
        attempt: submission.attempt,
        signature: submission.signature,
        errorMessage: submission.error_message,
      });
    } else {
      records.push({ id, status: 'missing' });
    }
  }

  return records;
}

module.exports = {
  submitTradeBatch,
  submitCertificationBatch,
  submitMixedBatch,
  retryFailedBatch,
  listBatchStatus,
  normalizeBatch,
};