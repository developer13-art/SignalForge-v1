/**
 * Affiliate Routes
 *
 * @module signalforge/server/routes/affiliate
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
  res.status(202).json({ message: 'Create affiliate link endpoint placeholder' });
});

router.delete('/links/:linkId', (req, res) => {
  res.status(202).json({ message: 'Delete affiliate link endpoint placeholder' });
});

router.get('/referrals', (req, res) => {
  res.status(200).json({ referrals: [] });
});

router.get('/commissions', (req, res) => {
  res.status(200).json({ commissions: [] });
});

router.get('/commissions/:commissionId', (req, res) => {
  res.status(200).json({ commission: null });
});

export default router;