/**
 * REST API Source Routes
 *
 * @module signalforge/server/routes/rest-api
 */
const { Router } = require('express');

const router = Router();

router.post('/keys', (req, res) => {
  res.status(202).json({ message: 'Create REST API key endpoint placeholder' });
});

router.get('/keys', (req, res) => {
  res.status(200).json({ keys: [] });
});

router.delete('/keys/:keyId', (req, res) => {
  res.status(202).json({ message: 'Revoke REST API key endpoint placeholder' });
});

router.post('/signal', (req, res) => {
  res.status(202).json({ message: 'Submit signal endpoint placeholder' });
});
module.exports = router;