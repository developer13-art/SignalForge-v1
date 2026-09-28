/**
 * Trade State Routes
 *
 * @module signalforge/server/routes/trade-state
 */

import { Router } from 'express';

const router = Router();

router.get('/:tradeId', (req, res) => {
  res.status(200).json({ trade: null });
});

router.get('/:tradeId/events', (req, res) => {
  res.status(200).json({ events: [] });
});

router.get('/:tradeId/timeline', (req, res) => {
  res.status(200).json({ timeline: [] });
});

router.post('/:tradeId/transition', (req, res) => {
  res.status(202).json({ message: 'Transition trade endpoint placeholder' });
});

export default router;