/**
 * Replay Routes
 *
 * @module signalforge/server/routes/replay
 */

import { Router } from 'express';

const router = Router();

router.get('/signals/:signalId', (req, res) => {
  res.status(200).json({ replay: null });
});

router.get('/trades/:tradeId', (req, res) => {
  res.status(200).json({ replay: null });
});

router.get('/ai/:signalId', (req, res) => {
  res.status(200).json({ replay: null });
});

router.get('/risk/:decisionId', (req, res) => {
  res.status(200).json({ replay: null });
});

router.get('/execution/:executionRequestId', (req, res) => {
  res.status(200).json({ replay: null });
});

router.get('/provider-message/:messageId', (req, res) => {
  res.status(200).json({ replay: null });
});

router.get('/system-timeline', (req, res) => {
  res.status(200).json({ timeline: [] });
});

export default router;