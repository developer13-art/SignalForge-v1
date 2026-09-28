/**
 * Withdrawal Routes
 *
 * @module signalforge/server/routes/withdrawal
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ withdrawals: [] });
});

router.post('/', (req, res) => {
  res.status(202).json({ message: 'Create withdrawal request endpoint placeholder' });
});

router.get('/:withdrawalId', (req, res) => {
  res.status(200).json({ withdrawal: null });
});

router.post('/:withdrawalId/cancel', (req, res) => {
  res.status(202).json({ message: 'Cancel withdrawal endpoint placeholder' });
});

router.get('/methods', (req, res) => {
  res.status(200).json({ methods: [] });
});

router.get('/accounts', (req, res) => {
  res.status(200).json({ accounts: [] });
});

router.post('/accounts', (req, res) => {
  res.status(202).json({ message: 'Add withdrawal account endpoint placeholder' });
});

router.delete('/accounts/:accountId', (req, res) => {
  res.status(202).json({ message: 'Delete withdrawal account endpoint placeholder' });
});

export default router;