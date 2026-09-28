/**
 * WhatsApp Routes
 *
 * @module signalforge/server/routes/whatsapp
 */

import { Router } from 'express';

const router = Router();

router.post('/connect', (req, res) => {
  res.status(202).json({ message: 'Connect WhatsApp endpoint placeholder' });
});

router.get('/groups', (req, res) => {
  res.status(200).json({ groups: [] });
});

router.post('/groups/opt-in', (req, res) => {
  res.status(202).json({ message: 'Opt-in groups endpoint placeholder' });
});

router.post('/groups/opt-out', (req, res) => {
  res.status(202).json({ message: 'Opt-out groups endpoint placeholder' });
});

router.get('/connections', (req, res) => {
  res.status(200).json({ connections: [] });
});

router.delete('/connections/:connectionId', (req, res) => {
  res.status(202).json({ message: 'Delete connection endpoint placeholder' });
});

router.get('/webhook', (req, res) => {
  const challenge = req.query['hub.challenge'];
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
});

export default router;