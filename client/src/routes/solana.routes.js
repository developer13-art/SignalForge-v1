'use strict';

const express = require('express');

const solanaActions = require('../modules/solana/actions/actions.routes');
const solanaBlinks = require('../modules/solana/actions/blinks/blink.routes');
const solanaProof = require('../modules/solana/proof-of-alpha/proof.routes');
const solanaProofLeaderboard = require('../modules/solana/proof-of-alpha/leaderboard/leaderboard.routes');
const paymentRoutes = require('../modules/solana/payments/solana-payment.routes');

/**
 * SignalForge - Solana Core Routes
 *
 * Mounts every Solana-related route namespace. The feature-specific
 * routes are also mounted at the top level in `routes/index.js` so
 * that consumers can use either `/solana/...` (nested) or the
 * canonical prefix declared by each feature.
 */

const router = express.Router();

router.use('/actions', solanaActions);
router.use('/actions/blinks', solanaBlinks);
router.use('/proof-of-alpha', solanaProof);
router.use('/proof-of-alpha/leaderboard', solanaProofLeaderboard);
router.use('/payments', paymentRoutes);

module.exports = router;