/**
 * Wallet Routes
 *
 * @module signalforge/server/routes/wallet
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ wallet: null });
});

router.get('/balance', (req, res) => {
  res.status(200).json({ balance: null });
});

router.get('/ledger', (req, res) => {
  res.status(200).json({ entries: [] });
});

router.post('/top-up', (req, res) => {
  res.status(202).json({ message: 'Wallet top-up endpoint placeholder' });
});

export default router;