/**
 * IB Routes
 *
 * @module signalforge/server/routes/ib
 */

import { Router } from 'express';

const router = Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({ dashboard: null });
});

router.get('/links', (req, res) => {
  res.status(200).json({ links: [] });
});

router.post('/links', (req, res) => {
  res.status(202).json({ message: 'Create IB link endpoint placeholder' });
});

router.delete('/links/:linkId', (req, res) => {
  res.status(202).json({ message: 'Delete IB link endpoint placeholder' });
});

router.get('/referrals', (req, res) => {
  res.status(200).json({ referrals: [] });
});

router.get('/revenue', (req, res) => {
  res.status(200).json({ revenue: null });
});

router.get('/commissions', (req, res) => {
  res.status(200).json({ commissions: [] });
});

export default router;