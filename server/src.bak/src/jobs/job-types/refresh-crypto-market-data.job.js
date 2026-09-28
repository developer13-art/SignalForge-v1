'use strict';

const priceFeed = require('../../modules/market-data/crypto/price-feed.service');
const liquidity = require('../../modules/market-data/crypto/liquidity.service');
const volume = require('../../modules/market-data/crypto/volume.service');

/**
 * Job: REFRESH_CRYPTO_MARKET_DATA
 *
 * Refreshes price, liquidity, and volume for a list of symbols. Used
 * by the scheduler to keep the market data cache warm for the pairs
 * that SignalForge actively trades.
 */

module.exports = {
  name: 'REFRESH_CRYPTO_MARKET_DATA',

  async execute(payload = {}) {
    const { symbols, refreshPrice = true, refreshLiquidity = false, refreshVolume = false } =
      payload;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error('REFRESH_CRYPTO_MARKET_DATA requires a non-empty symbols array');
    }

    const results = [];

    for (const symbol of symbols) {
      const entry = { symbol };

      if (refreshPrice) {
        try {
          entry.price = await priceFeed.fetchPrice({ symbol });
        } catch (error) {
          entry.priceError = error.message;
        }
      }

      if (refreshLiquidity) {
        try {
          entry.liquidity = await liquidity.fetchLiquidity({ symbol });
        } catch (error) {
          entry.liquidityError = error.message;
        }
      }

      if (refreshVolume) {
        try {
          entry.volume = await volume.fetchVolume({ symbol });
        } catch (error) {
          entry.volumeError = error.message;
        }
      }

      results.push(entry);
    }

    return { results };
  },

  schedule: '*/1 * * * *',

  retry: {
    maxAttempts: 3,
    backoffMs: [5000, 15000, 60000],
  },

  timeoutMs: 120000,
};