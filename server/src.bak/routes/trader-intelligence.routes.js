/**
 * Trader Intelligence Routes
 *
 * @module signalforge/server/routes/trader-intelligence
 */

import { Router } from 'express';

const router = Router();

router.get('/overview', (req, res) => {
  res.status(200).json({ overview: null });
});

router.get('/consistency', (req, res) => {
  res.status(200).json({ consistency: null });
});

router.get('/discipline', (req, res) => {
  res.status(200).json({ discipline: null });
});

router.get('/average-rr', (req, res) => {
  res.status(200).json({ averageRr: null });
});

router.get('/holding-time', (req, res) => {
  res.status(200).json({ holdingTime: null });
});

router.get('/risk-behavior', (req, res) => {
  res.status(200).json({ riskBehavior: null });
});

router.get('/martingale-detection', (req, res) => {
  res.status(200).json({ detection: null });
});

router.get('/grid-detection', (req, res) => {
  res.status(200).json({ detection: null });
});

router.get('/news-exposure', (req, res) => {
  res.status(200).json({ newsExposure: null });
});

router.get('/recovery-trading', (req, res) => {
  res.status(200).json({ recoveryTrading: null });
});

router.get('/style-classification', (req, res) => {
  res.status(200).json({ classification: null });
});

router.get('/behavior-timeline', (req, res) => {
  res.status(200).json({ timeline: [] });
});

export default router;