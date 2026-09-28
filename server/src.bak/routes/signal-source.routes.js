/**
 * Signal Source Routes
 *
 * @module signalforge/server/routes/signal-source
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ sources: [] });
});

router.post('/', (req, res) => {
  res.status(202).json({ message: 'Create source endpoint placeholder' });
});

router.get('/:sourceId', (req, res) => {
  res.status(200).json({ source: null });
});

router.patch('/:sourceId', (req, res) => {
  res.status(202).json({ message: 'Update source endpoint placeholder' });
});

router.delete('/:sourceId', (req, res) => {
  res.status(202).json({ message: 'Delete source endpoint placeholder' });
});

router.post('/:sourceId/enable', (req, res) => {
  res.status(202).json({ message: 'Enable source endpoint placeholder' });
});

router.post('/:sourceId/disable', (req, res) => {
  res.status(202).json({ message: 'Disable source endpoint placeholder' });
});

router.get('/:sourceId/messages', (req, res) => {
  res.status(200).json({ messages: [] });
});

router.get('/:sourceId/messages/:messageId', (req, res) => {
  res.status(200).json({ message: null });
});

router.get('/:sourceId/logs', (req, res) => {
  res.status(200).json({ logs: [] });
});

export default router;