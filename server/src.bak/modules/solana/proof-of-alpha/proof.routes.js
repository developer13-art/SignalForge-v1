'use strict';

const express = require('express');

const proofController = require('./proof.controller');
const actionsMiddleware = require('../actions/actions.middleware');

const router = express.Router();

const readLimiter = actionsMiddleware.createRateLimiter({
  windowMs: 60000,
  max: 240,
});

const writeLimiter = actionsMiddleware.createRateLimiter({
  windowMs: 60000,
  max: 30,
});

router.use(actionsMiddleware.requestIdMiddleware);

router.get('/leaderboard', readLimiter, proofController.getLeaderboard);
router.post('/leaderboard/refresh', writeLimiter, proofController.refreshLeaderboard);

router.get('/proofs', readLimiter, proofController.listPublicProofs);
router.get('/proofs/:proofId', readLimiter, proofController.getProof);
router.get('/proofs/signature/:signature', readLimiter, proofController.getProofBySignature);
router.get('/proofs/signature/:signature/verify', readLimiter, proofController.verifyProof);
router.get('/proofs/signature/:signature/on-chain', readLimiter, proofController.verifyOnChain);

router.get('/providers/:providerId/proofs', readLimiter, proofController.listProofsByProvider);
router.get(
  '/providers/:providerId/verification',
  readLimiter,
  proofController.getVerificationSummary,
);

router.use(actionsMiddleware.errorHandlerMiddleware);

module.exports = router;