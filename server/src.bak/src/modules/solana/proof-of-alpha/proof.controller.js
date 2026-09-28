'use strict';

const proofService = require('./proof.service');
const proofValidator = require('./proof.validator');
const leaderboardService = require('./leaderboard/leaderboard.service');
const verificationService = require('./verification/verifier.service');

const { InvalidProviderError } = require('./proof.errors');

/**
 * SignalForge - Proof of Alpha HTTP Controller
 *
 * Thin translation layer for proof endpoints. All business rules live
 * in services. Public endpoints intentionally do not require
 * authentication so that on-chain proofs can be verified by anyone.
 */

async function getProof(req, res, next) {
  try {
    const proof = await proofService.getProofById(req.params.proofId);
    return res.status(200).json(proof);
  } catch (error) {
    return next(error);
  }
}

async function getProofBySignature(req, res, next) {
  try {
    const proof = await proofService.getProofBySignature(req.params.signature);
    return res.status(200).json(proof);
  } catch (error) {
    return next(error);
  }
}

async function listProofsByProvider(req, res, next) {
  try {
    const providerId = req.params.providerId;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const pageSize = Number.parseInt(req.query.pageSize, 10) || 20;
    const status = req.query.status || undefined;
    const kind = req.query.kind || undefined;

    const result = await proofService.listProofsByProvider(providerId, {
      page,
      pageSize,
      status,
      kind,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listPublicProofs(req, res, next) {
  try {
    const providerId = req.query.providerId || undefined;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const pageSize = Number.parseInt(req.query.pageSize, 10) || 20;

    const result = await proofService.listPublicProofs({ providerId, page, pageSize });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function verifyProof(req, res, next) {
  try {
    const signature = req.params.signature;
    const result = await proofService.verifyProofBySignature(signature, {
      requestId: req.requestId || null,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getVerificationSummary(req, res, next) {
  try {
    const providerId = req.params.providerId;
    if (!providerId) {
      throw new InvalidProviderError('Provider identifier is required');
    }

    const from = req.query.from || undefined;
    const to = req.query.to || undefined;

    const summary = await proofService.getProviderVerificationSummary(providerId, { from, to });
    return res.status(200).json(summary);
  } catch (error) {
    return next(error);
  }
}

async function getLeaderboard(req, res, next) {
  try {
    const window = proofValidator.validateLeaderboardWindow(req.query.window);
    const sortBy = proofValidator.validateLeaderboardSort(req.query.sortBy);
    const limit = proofValidator.validateLeaderboardLimit(req.query.limit);
    const offset = Number.parseInt(req.query.offset, 10) || 0;

    const result = await leaderboardService.getLeaderboard({
      window,
      sortBy,
      limit,
      offset,
      requestId: req.requestId || null,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function refreshLeaderboard(req, res, next) {
  try {
    const window = proofValidator.validateLeaderboardWindow(req.body.window || req.query.window);
    const sortBy = proofValidator.validateLeaderboardSort(req.body.sortBy || req.query.sortBy);

    const result = await leaderboardService.refreshLeaderboard({
      window,
      sortBy,
      requestId: req.requestId || null,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function verifyOnChain(req, res, next) {
  try {
    const signature = req.params.signature;
    const result = await verificationService.verifyRaw({
      signature,
      requestId: req.requestId || null,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProof,
  getProofBySignature,
  listProofsByProvider,
  listPublicProofs,
  verifyProof,
  getVerificationSummary,
  getLeaderboard,
  refreshLeaderboard,
  verifyOnChain,
};