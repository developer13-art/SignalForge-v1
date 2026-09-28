/**
 * Trade Shadow Routes
 *
 * @module signalforge/server/routes/trade-shadow
 */
const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ shadows: [] });
});

router.get('/:shadowId', (req, res) => {
  res.status(200).json({ shadow: null });
});

router.get('/trade/:tradeId', (req, res) => {
  res.status(200).json({ shadow: null });
});

router.get('/user/insights', (req, res) => {
  res.status(200).json({ insights: null });
});
module.exports = router;