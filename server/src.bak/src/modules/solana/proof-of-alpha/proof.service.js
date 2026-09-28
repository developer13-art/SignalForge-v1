'use strict';

const crypto = require('crypto');

const proofRepository = require('./proof.repository');
const proofValidator = require('./proof.validator');

const memoService = require('./memo/memo.service');
const verificationService = require('./verification/verifier.service');

const {
  PROOF_KINDS,
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
} = require('./proof.constants');

const {
  ProofNotFoundError,
  InvalidProviderError,
  InvalidTradeError,
  ServiceUnavailableError,
  SubmissionFailedError,
} = require('./proof.errors');

const {
  buildProofRequestedEvent,
  buildMemoConfirmedEvent,
} = require('./proof.events');

const { config } = require('./proof.config');

/**
 * SignalForge - Proof of Alpha Service
 *
 * Top-level orchestration service. Callers use this service to write
 * trade-close proofs, certification proofs, milestone proofs, and to
 * retrieve proofs for the public verification page and the on-chain
 * leaderboard.
 */

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
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
}

function meetsSignificanceThreshold({ pnlUsd, pnlPercent }) {
  const threshold = config.significance;

  if (!threshold.includeLosingTrades && (pnlUsd < 0 || pnlPercent < 0)) {
    return false;
  }

  if (Math.abs(pnlUsd) < threshold.minPnlAbsolute && Math.abs(pnlPercent) < threshold.minPnlPercent) {
    return false;
  }

  return true;
}

async function writeTradeCloseProof({
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
  await ensureEnabled();

  if (!config.featureFlags.writeTrades) {
    return null;
  }

  const validatedProviderId = proofValidator.validateProviderId(providerId);
  const validatedTradeId = proofValidator.validateTradeId(tradeId);

  if (!meetsSignificanceThreshold({ pnlUsd, pnlPercent })) {
    return null;
  }

  const result = await memoService.submitTradeProof({
    providerId: validatedProviderId,
    tradeId: validatedTradeId,
    symbol,
    direction,
    pnlUsd,
    pnlPercent,
    openedAt,
    closedAt,
    confidence,
    signalId,
    requestId,
  });

  emitEvent(
    'solana.proof.requested',
    buildProofRequestedEvent({
      providerId: validatedProviderId,
      tradeId: validatedTradeId,
      kind: PROOF_KINDS.TRADE_CLOSED,
      requestId,
    }).payload,
  );

  return result;
}

async function writeCertificationProof({
  providerId,
  qualityScore,
  requestId,
}) {
  await ensureEnabled();

  if (!config.featureFlags.writeCertifications) {
    return null;
  }

  const validatedProviderId = proofValidator.validateProviderId(providerId);

  const result = await memoService.submitCertificationProof({
    providerId: validatedProviderId,
    qualityScore,
    requestId,
  });

  return result;
}

async function writeMilestoneProof({ providerId, milestoneKey, requestId }) {
  await ensureEnabled();

  if (!config.featureFlags.writeMilestones) {
    return null;
  }

  const validatedProviderId = proofValidator.validateProviderId(providerId);

  const result = await memoService.submitMilestoneProof({
    providerId: validatedProviderId,
    milestoneKey,
    requestId,
  });

  return result;
}

async function getProofById(proofId) {
  await ensureEnabled();
  const proof = await proofRepository.findProofById(proofId);
  if (!proof) {
    throw new ProofNotFoundError(`Proof ${proofId} was not found`);
  }
  return proof;
}

async function getProofBySignature(signature) {
  await ensureEnabled();
  const validatedSignature = proofValidator.validateSignature(signature);
  const proof = await proofRepository.findProofBySignature(validatedSignature);
  if (!proof) {
    throw new ProofNotFoundError(`Proof for signature ${validatedSignature} was not found`);
  }
  return proof;
}

async function listProofsByProvider(providerId, filters = {}) {
  await ensureEnabled();
  const validatedProviderId = proofValidator.validateProviderId(providerId);
  return proofRepository.findProofsByProvider(validatedProviderId, filters);
}

async function listPublicProofs(filters = {}) {
  await ensureEnabled();
  return proofRepository.listPublicProofs(filters);
}

async function verifyProofBySignature(signature, { requestId } = {}) {
  await ensureEnabled();

  const validatedSignature = proofValidator.validateSignature(signature);

  const proof = await proofRepository.findProofBySignature(validatedSignature);

  const verification = await verificationService.verify({
    signature: validatedSignature,
    proof,
    requestId,
  });

  return verification;
}

async function getProviderVerificationSummary(providerId, { from, to } = {}) {
  await ensureEnabled();
  const validatedProviderId = proofValidator.validateProviderId(providerId);
  const range = proofValidator.validateDateRange({ from, to });

  const [stats, verifiedCount] = await Promise.all([
    proofRepository.aggregateProviderStats({
      providerId: validatedProviderId,
      from: range.from,
      to: range.to,
    }),
    proofRepository.countProofsByProvider({
      providerId: validatedProviderId,
      status: PROOF_STATUSES.CONFIRMED,
      from: range.from,
      to: range.to,
    }),
  ]);

  const totalTrades = Number(stats.total_proofs) || 0;
  const winningTrades = Number(stats.winning_trades) || 0;
  const losingTrades = Number(stats.losing_trades) || 0;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnl = Number(stats.total_pnl_usd) || 0;
  const avgPnlPercent = Number(stats.average_pnl_percent) || 0;

  const grossProfit = winningTrades > 0 ? totalPnl * (winningTrades / (winningTrades + losingTrades || 1)) : 0;
  const grossLoss = losingTrades > 0 ? Math.abs(totalPnl) * (losingTrades / (winningTrades + losingTrades || 1)) : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  let verificationLevel = PROOF_VERIFICATION_LEVELS.UNVERIFIED;
  if (verifiedCount > 0) {
    verificationLevel = PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED;
  } else if (totalTrades > 0) {
    verificationLevel = PROOF_VERIFICATION_LEVELS.PARTIAL;
  }

  return {
    providerId: validatedProviderId,
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades: Number(stats.break_even_trades) || 0,
    winRate: Math.round(winRate * 100) / 100,
    totalPnlUsd: Math.round(totalPnl * 100) / 100,
    averagePnlPercent: Math.round(avgPnlPercent * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    verifiedProofs: verifiedCount,
    verificationLevel,
    from: range.from,
    to: range.to,
  };
}

async function getProviderStatsForLeaderboard({ providerId, from, to } = {}) {
  const validatedProviderId = proofValidator.validateProviderId(providerId);
  return proofRepository.aggregateProviderStats({
    providerId: validatedProviderId,
    from,
    to,
  });
}

async function getProofsByProviderForVerification({ providerId, limit = 100 } = {}) {
  return proofRepository.findProofsByProvider(providerId, { page: 1, pageSize: limit });
}

async function getPendingProofs({ olderThanMs, limit } = {}) {
  return proofRepository.listPendingProofs({ olderThanMs, limit });
}

async function markProofConfirmed({ proofId, signature, blockSlot, blockTime, requestId }) {
  const updated = await proofRepository.updateProofStatus(proofId, {
    status: PROOF_STATUSES.CONFIRMED,
    blockSlot,
    blockTime,
    confirmedAt: new Date().toISOString(),
  });

  if (updated) {
    emitEvent(
      'solana.proof.memo.confirmed',
      buildMemoConfirmedEvent({
        providerId: updated.provider_id,
        tradeId: updated.trade_id,
        signature: updated.signature || signature,
        blockSlot,
        requestId,
      }).payload,
    );
  }

  return updated;
}

async function markProofFailed({ proofId, signature, reason, requestId }) {
  const updated = await proofRepository.updateProofStatus(proofId, {
    status: PROOF_STATUSES.FAILED,
    signature,
    errorMessage: reason,
  });

  if (!updated) {
    throw new SubmissionFailedError('Failed to mark proof as failed', {
      proofId,
      reason,
    });
  }

  emitEvent('solana.proof.memo.failed', {
    providerId: updated.provider_id,
    tradeId: updated.trade_id,
    signature,
    reason,
  });

  return updated;
}

async function countProviderProofs({ providerId, from, to } = {}) {
  return proofRepository.countProofsByProvider({ providerId, from, to });
}

module.exports = {
  ensureEnabled,
  writeTradeCloseProof,
  writeCertificationProof,
  writeMilestoneProof,
  getProofById,
  getProofBySignature,
  listProofsByProvider,
  listPublicProofs,
  verifyProofBySignature,
  getProviderVerificationSummary,
  getProviderStatsForLeaderboard,
  getProofsByProviderForVerification,
  getPendingProofs,
  markProofConfirmed,
  markProofFailed,
  countProviderProofs,
  meetsSignificanceThreshold,
};