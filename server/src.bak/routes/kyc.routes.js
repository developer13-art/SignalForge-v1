/**
 * KYC Routes
 *
 * @module signalforge/server/routes/kyc
 */

import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.status(200).json({ status: 'NOT_STARTED' });
});

router.post('/applications', (req, res) => {
  res.status(202).json({ message: 'Create KYC application endpoint placeholder' });
});

router.get('/applications/me', (req, res) => {
  res.status(200).json({ application: null });
});

router.get('/applications/:applicationId', (req, res) => {
  res.status(200).json({ application: null });
});

router.post('/applications/:applicationId/personal-info', (req, res) => {
  res.status(202).json({ message: 'Submit personal info endpoint placeholder' });
});

router.post('/applications/:applicationId/documents', (req, res) => {
  res.status(202).json({ message: 'Upload document endpoint placeholder' });
});

router.get('/applications/:applicationId/documents', (req, res) => {
  res.status(200).json({ documents: [] });
});

router.delete('/applications/:applicationId/documents/:documentId', (req, res) => {
  res.status(202).json({ message: 'Delete document endpoint placeholder' });
});

router.post('/applications/:applicationId/selfie', (req, res) => {
  res.status(202).json({ message: 'Upload selfie endpoint placeholder' });
});

router.post('/applications/:applicationId/submit', (req, res) => {
  res.status(202).json({ message: 'Submit KYC application endpoint placeholder' });
});

router.post('/applications/:applicationId/resubmit', (req, res) => {
  res.status(202).json({ message: 'Resubmit KYC application endpoint placeholder' });
});

router.get('/document-types', (req, res) => {
  res.status(200).json({ documentTypes: [] });
});

export default router;