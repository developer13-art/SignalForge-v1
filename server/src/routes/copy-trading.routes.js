/**
 * Copy Trading Routes
 *
 * @module signalforge/server/routes/copy-trading
 */

import { Router } from 'express';

const router = Router();

router.get('/subscriptions', (req, res) => {
  res.status(200).json({ subscriptions: [] });
});

router.post('/subscriptions', (req, res) => {
  res.status(202).json({ message: 'Subscribe to provider endpoint placeholder' });
});

router.delete('/subscriptions/:subscriptionId', (req, res) => {
  res.status(202).json({ message: 'Unsubscribe endpoint placeholder' });
});

router.patch('/subscriptions/:subscriptionId', (req, res) => {
  res.status(202).json({ message: 'Update subscription endpoint placeholder' });
});

router.get('/settings', (req, res) => {
  res.status(200).json({ settings: null });
});

router.patch('/settings', (req, res) => {
  res.status(202).json({ message: 'Update copy settings endpoint placeholder' });
});

router.get('/latency', (req, res) => {
  res.status(200).json({ latency: null });
});

export default router;