/**
 * Public Verification Routes
 *
 * @module signalforge/server/routes/verification
 */

import { Router } from 'express';

const router = Router();

router.get('/provider/:providerId', (req, res) => {
  res.status(200).json({ verification: null });
});

router.get('/attestation/:attestationHash', (req, res) => {
  res.status(200).json({ verification: null });
});

router.get('/provenance/:signalId', (req, res) => {
  res.status(200).json({ verification: null });
});

router.get('/tx/:signature', (req, res) => {
  res.status(200).json({ verification: null });
});

router.get('/wallet/:address', (req, res) => {
  res.status(200).json({ verification: null });
});

export default router;