/**
 * Discord Routes
 *
 * @module signalforge/server/routes/discord
 */

import { Router } from 'express';

const router = Router();

router.get('/authorize', (req, res) => {
  res.status(200).json({ url: null });
});

router.get('/callback', (req, res) => {
  res.status(202).json({ message: 'Discord OAuth callback endpoint placeholder' });
});

router.get('/guilds', (req, res) => {
  res.status(200).json({ guilds: [] });
});

router.get('/guilds/:guildId/channels', (req, res) => {
  res.status(200).json({ channels: [] });
});

router.post('/channels/opt-in', (req, res) => {
  res.status(202).json({ message: 'Opt-in channels endpoint placeholder' });
});

router.post('/channels/opt-out', (req, res) => {
  res.status(202).json({ message: 'Opt-out channels endpoint placeholder' });
});

router.get('/connections', (req, res) => {
  res.status(200).json({ connections: [] });
});

router.delete('/connections/:connectionId', (req, res) => {
  res.status(202).json({ message: 'Delete connection endpoint placeholder' });
});

export default router;