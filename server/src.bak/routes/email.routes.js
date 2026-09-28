/**
 * Email Routes
 *
 * @module signalforge/server/routes/email
 */

import { Router } from 'express';

const router = Router();

router.post('/connections', (req, res) => {
  res.status(202).json({ message: 'Create email connection endpoint placeholder' });
});

router.get('/connections', (req, res) => {
  res.status(200).json({ connections: [] });
});

router.delete('/connections/:connectionId', (req, res) => {
  res.status(202).json({ message: 'Delete email connection endpoint placeholder' });
});

router.post('/connections/:connectionId/test', (req, res) => {
  res.status(202).json({ message: 'Test email connection endpoint placeholder' });
});

export default router;