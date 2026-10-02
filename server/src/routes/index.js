'use strict';

const express = require('express');

const router = express.Router();

/**
 * SignalForge - Central Route Registry
 *
 * Every modular route file is mounted here. The order of mounts
 * matters: broad prefixes are mounted last so that more specific
 * routes take precedence. New feature modules (Solana Actions,
 * Proof of Alpha, crypto trading, execution router, crypto market
 * data) are mounted below the existing routes without altering the
 * existing ones.
 */

// -------------------- Public / unauthenticated --------------------
router.use('/public', require('./public.routes'));

// -------------------- Health (unauthenticated) --------------------
// Mounted directly under /api/health so that load balancers and
// container orchestrators can probe without authentication.
// Exposes: /, /live, /ready, /detailed
router.use('/health', require('./health.routes'));

// -------------------- Authentication --------------------
router.use('/auth', require('./auth.routes'));

// -------------------- User-facing --------------------
router.use('/users', require('./user.routes'));
router.use('/rbac', require('./rbac.routes'));
router.use('/kyc', require('./kyc.routes'));
router.use('/sources', require('./signal-source.routes'));
router.use('/sources/telegram', require('./telegram.routes'));
router.use('/sources/discord', require('./discord.routes'));
router.use('/sources/whatsapp', require('./whatsapp.routes'));
router.use('/sources/tradingview', require('./tradingview.routes'));
router.use('/sources/email', require('./email.routes'));
router.use('/sources/rest-api', require('./rest-api.routes'));
router.use('/signals', require('./signal.routes'));
router.use('/ai', require('./ai.routes'));
router.use('/provider-dna', require('./provider-dna.routes'));
router.use('/trade-matching', require('./trade-matching.routes'));
router.use('/consensus', require('./consensus.routes'));
router.use('/validation', require('./validation.routes'));
router.use('/risk', require('./risk.routes'));
router.use('/automation', require('./automation.routes'));
router.use('/execution', require('./execution.routes'));
router.use('/trade-state', require('./trade-state.routes'));
router.use('/trade-shadow', require('./trade-shadow.routes'));
router.use('/copy-trading', require('./copy-trading.routes'));
router.use('/brokers', require('../modules/brokers/broker.routes')());
router.use('/trades', require('./trade.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/performance', require('./performance.routes'));
router.use('/subscriptions', require('./subscription.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/wallets', require('./wallet.routes'));
router.use('/withdrawals', require('./withdrawal.routes'));
router.use('/referrals', require('./referral.routes'));
router.use('/providers', require('./provider.routes'));
router.use('/provider-certification', require('./provider-certification.routes'));
router.use('/marketplace', require('./marketplace.routes'));
router.use('/traders', require('./trader.routes'));
router.use('/trader-intelligence', require('./trader-intelligence.routes'));
router.use('/affiliate', require('./affiliate.routes'));
router.use('/ib', require('./ib.routes'));
router.use('/white-label', require('./white-label.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/replay', require('./replay.routes'));
router.use('/support', require('./support.routes'));

// -------------------- Solana Actions & Blinks (Feature A) --------------------
router.use('/solana/actions', require('../modules/solana/actions/actions.routes'));
router.use(
  '/solana/actions/blinks',
  require('../modules/solana/actions/blinks/blink.routes'),
);

// -------------------- Proof of Alpha (Feature B) --------------------
router.use(
  '/solana/proof-of-alpha',
  require('../modules/solana/proof-of-alpha/proof.routes'),
);
router.use(
  '/solana/proof-of-alpha/leaderboard',
  require('../modules/solana/proof-of-alpha/leaderboard/leaderboard.routes'),
);

// -------------------- Solana core (existing) --------------------
router.use('/solana', require('../modules/solana/solana.routes'));

// -------------------- Hybrid Execution (Feature C) --------------------
router.use(
  '/execution/router',
  require('../modules/execution/routers/execution-router.routes'),
);
router.use(
  '/crypto-trading',
  require('./crypto-trading.routes'),
);
router.use(
  '/crypto-trading/signals',
  require('../modules/signals/crypto/crypto-symbol.routes'),
);
router.use(
  '/crypto-trading/market-data',
  require('../modules/market-data/crypto/market-data.routes'),
);

// -------------------- Admin consoles --------------------
router.use('/admin', require('../modules/admin/admin.routes'));
router.use('/compliance', require('../modules/compliance/compliance.routes'));
router.use('/executive', require('./executive.routes'));

// -------------------- Webhooks --------------------
router.use('/webhooks', require('./webhook.routes'));

module.exports = router;