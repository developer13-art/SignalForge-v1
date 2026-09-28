/**
 * Performance Routes
 *
 * @module signalforge/server/routes/performance
 */

import { Router } from 'express';

const router = Router();

router.get('/periods', (req, res) => {
  res.status(200).json({ periods: [] });
});

router.get('/periods/:period', (req, res) => {
  res.status(200).json({ period: null });
});

router.get('/metrics', (req, res) => {
  res.status(200).json({ metrics: null });
});

router.get('/equity', (req, res) => {
  res.status(200).json({ equity: [] });
});

router.get('/eligible-net-profit', (req, res) => {
  res.status(200).json({ eligibleNetProfit: null });
});

export default router;