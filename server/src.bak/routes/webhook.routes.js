/**
 * Webhook Routes
 *
 * @module signalforge/server/routes/webhook
 */

import { Router } from 'express';

const router = Router();

router.post('/stripe', (req, res) => {
  res.status(202).json({ message: 'Stripe webhook endpoint placeholder' });
});

router.post('/paystack', (req, res) => {
  res.status(202).json({ message: 'Paystack webhook endpoint placeholder' });
});

router.post('/flutterwave', (req, res) => {
  res.status(202).json({ message: 'Flutterwave webhook endpoint placeholder' });
});

router.post('/kyc/smileid', (req, res) => {
  res.status(202).json({ message: 'Smile ID webhook endpoint placeholder' });
});

router.post('/kyc/verifyme', (req, res) => {
  res.status(202).json({ message: 'VerifyMe webhook endpoint placeholder' });
});

router.post('/tradingview', (req, res) => {
  res.status(202).json({ message: 'TradingView webhook endpoint placeholder' });
});

router.post('/solana', (req, res) => {
  res.status(202).json({ message: 'Solana webhook endpoint placeholder' });
});

router.post('/telegram', (req, res) => {
  res.status(202).json({ message: 'Telegram webhook endpoint placeholder' });
});

router.post('/discord', (req, res) => {
  res.status(202).json({ message: 'Discord webhook endpoint placeholder' });
});

router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Forbidden');
});

router.post('/whatsapp', (req, res) => {
  res.status(202).json({ message: 'WhatsApp webhook endpoint placeholder' });
});

export default router;