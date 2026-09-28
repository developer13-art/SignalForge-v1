/**
 * TradingView Routes
 *
 * @module signalforge/server/routes/tradingview
 */

import { Router } from 'express';

const router = Router();

router.get('/webhooks', (req, res) => {
  res.status(200).json({ webhooks: [] });
});

router.post('/webhooks', (req, res) => {
  res.status(202).json({ message: 'Create TradingView webhook endpoint placeholder' });
});

router.delete('/webhooks/:webhookId', (req, res) => {
  res.status(202).json({ message: 'Delete TradingView webhook endpoint placeholder' });
});

router.post('/webhooks/:webhookId/rotate-secret', (req, res) => {
  res.status(202).json({ message: 'Rotate webhook secret endpoint placeholder' });
});

export default router;