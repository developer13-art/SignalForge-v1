/**
 * Trade Routes
 *
 * @module signalforge/server/routes/trade
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ trades: [] });
});

router.get('/open', (req, res) => {
  res.status(200).json({ trades: [] });
});

router.get('/history', (req, res) => {
  res.status(200).json({ trades: [] });
});

router.get('/closed', (req, res) => {
  res.status(200).json({ trades: [] });
});

router.get('/pending-orders', (req, res) => {
  res.status(200).json({ orders: [] });
});

router.get('/manual-interventions', (req, res) => {
  res.status(200).json({ interventions: [] });
});

router.get('/:tradeId', (req, res) => {
  res.status(200).json({ trade: null });
});

router.post('/manual-open', (req, res) => {
  res.status(202).json({ message: 'Manual open trade endpoint placeholder' });
});

router.post('/:tradeId/manual-close', (req, res) => {
  res.status(202).json({ message: 'Manual close trade endpoint placeholder' });
});

router.post('/:tradeId/manual-modify', (req, res) => {
  res.status(202).json({ message: 'Manual modify trade endpoint placeholder' });
});

export default router;