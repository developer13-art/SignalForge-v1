/**
 * Support Routes
 *
 * @module signalforge/server/routes/support
 */

import { Router } from 'express';

const router = Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({ dashboard: null });
});

router.get('/tickets', (req, res) => {
  res.status(200).json({ tickets: [] });
});

router.post('/tickets', (req, res) => {
  res.status(202).json({ message: 'Create ticket endpoint placeholder' });
});

router.get('/tickets/:ticketId', (req, res) => {
  res.status(200).json({ ticket: null });
});

router.patch('/tickets/:ticketId', (req, res) => {
  res.status(202).json({ message: 'Update ticket endpoint placeholder' });
});

router.post('/tickets/:ticketId/reply', (req, res) => {
  res.status(202).json({ message: 'Reply to ticket endpoint placeholder' });
});

router.post('/tickets/:ticketId/close', (req, res) => {
  res.status(202).json({ message: 'Close ticket endpoint placeholder' });
});

router.get('/knowledge-base', (req, res) => {
  res.status(200).json({ articles: [] });
});

router.get('/knowledge-base/:articleId', (req, res) => {
  res.status(200).json({ article: null });
});

router.get('/faq/trading', (req, res) => {
  res.status(200).json({ faq: [] });
});

router.get('/faq/kyc', (req, res) => {
  res.status(200).json({ faq: [] });
});

router.get('/faq/billing', (req, res) => {
  res.status(200).json({ faq: [] });
});

export default router;