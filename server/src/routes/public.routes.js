/**
 * Public Routes
 *
 * Exposes unauthenticated endpoints used by the public marketing
 * site, marketplace previews, and status pages.
 *
 * @module signalforge/server/routes/public
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    name: 'SignalForge AI',
    version: '1.0.0',
    description: 'Enterprise Trading Intelligence Platform',
    documentation: '/api/docs',
    status: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

router.get('/features', (req, res) => {
  res.status(200).json({
    features: [
      'AI Signal Intelligence',
      'Automated Trading',
      'Risk Management',
      'Copy Trading',
      'Analytics',
      'Provider Marketplace',
      'Trader Marketplace',
      'KYC Verification',
      'Referral Program',
      'Solana Provenance',
    ],
  });
});

router.get('/pricing', (req, res) => {
  res.status(200).json({
    plans: [
      { code: 'MONTHLY', name: 'Monthly', price: 19, currency: 'USD', interval: 'MONTHLY' },
      { code: 'YEARLY', name: 'Yearly', price: 190, currency: 'USD', interval: 'YEARLY' },
    ],
  });
});

router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    components: {
      api: 'operational',
      database: 'operational',
      signals: 'operational',
      trading: 'operational',
      solana: 'operational',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;