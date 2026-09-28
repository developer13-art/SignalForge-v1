'use strict';

const {
  JUPITER_DEFAULT_SLIPPAGE_BPS,
  JUPITER_MIN_SLIPPAGE_BPS,
  JUPITER_MAX_SLIPPAGE_BPS,
} = require('./jupiter.constants');

const {
  InvalidRequestError,
} = require('./jupiter.errors');

/**
 * SignalForge - Jupiter Slippage Service
 *
 * Resolves the effective slippage for a swap by combining the user's
 * configured slippage, the router policy, and the symbol pair. The
 * service never returns a value outside the Jupiter-supported range.
 */

const PAIR_CLASS_SLIPPAGE = Object.freeze({
  stable_stable: 5,
  major_major: 10,
  major_alt: 25,
  alt_alt: 50,
  meme_alt: 100,
  low_liquidity: 300,
});

const STABLE_SYMBOLS = new Set(['USDC', 'USDT', 'DAI', 'USDE', 'FDUSD', 'PYUSD', 'TUSD']);
const MAJOR_SYMBOLS = new Set(['SOL', 'WSOL', 'BTC', 'WBTC', 'ETH', 'WETH', 'JUP']);
const MEME_SYMBOLS = new Set(['BONK', 'WIF', 'MEME', 'PEPE', 'SHIB']);

function classifyPair(inputSymbol, outputSymbol) {
  const input = (inputSymbol || '').toUpperCase();
  const output = (outputSymbol || '').toUpperCase();

  const inputIsStable = STABLE_SYMBOLS.has(input);
  const outputIsStable = STABLE_SYMBOLS.has(output);
  const inputIsMajor = MAJOR_SYMBOLS.has(input);
  const outputIsMajor = MAJOR_SYMBOLS.has(output);
  const inputIsMeme = MEME_SYMBOLS.has(input);
  const outputIsMeme = MEME_SYMBOLS.has(output);

  if (inputIsStable && outputIsStable) {
    return 'stable_stable';
  }
  if (inputIsMajor && outputIsMajor) {
    return 'major_major';
  }
  if ((inputIsMajor && !outputIsMajor && !outputIsStable) || (outputIsMajor && !inputIsMajor && !inputIsStable)) {
    return 'major_alt';
  }
  if (inputIsMeme || outputIsMeme) {
    return 'meme_alt';
  }
  return 'alt_alt';
}

function clampSlippage(bps) {
  const numeric = Number(bps);
  if (!Number.isFinite(numeric)) {
    return JUPITER_DEFAULT_SLIPPAGE_BPS;
  }
  if (numeric < JUPITER_MIN_SLIPPAGE_BPS) {
    return JUPITER_MIN_SLIPPAGE_BPS;
  }
  if (numeric > JUPITER_MAX_SLIPPAGE_BPS) {
    return JUPITER_MAX_SLIPPAGE_BPS;
  }
  return Math.round(numeric);
}

function resolveSlippage({
  userSlippageBps,
  policySlippageBps,
  inputSymbol,
  outputSymbol,
  volumeHint,
} = {}) {
  const candidates = [];

  if (userSlippageBps !== undefined && userSlippageBps !== null) {
    candidates.push(clampSlippage(userSlippageBps));
  }

  if (policySlippageBps !== undefined && policySlippageBps !== null) {
    candidates.push(clampSlippage(policySlippageBps));
  }

  const pairClass = classifyPair(inputSymbol, outputSymbol);
  candidates.push(PAIR_CLASS_SLIPPAGE[pairClass] || JUPITER_DEFAULT_SLIPPAGE_BPS);

  let volumeAdjustment = 0;
  if (volumeHint && Number.isFinite(Number(volumeHint.amountUsd))) {
    const amountUsd = Number(volumeHint.amountUsd);
    if (amountUsd > 100000) {
      volumeAdjustment = 50;
    } else if (amountUsd > 10000) {
      volumeAdjustment = 20;
    } else if (amountUsd > 1000) {
      volumeAdjustment = 5;
    }
  }

  const effective = clampSlippage(Math.max(...candidates) + volumeAdjustment);

  return {
    slippageBps: effective,
    pairClass,
    candidates,
    volumeAdjustment,
  };
}

function validateSlippageValue(slippageBps) {
  if (slippageBps === undefined || slippageBps === null) {
    return JUPITER_DEFAULT_SLIPPAGE_BPS;
  }
  const numeric = Number(slippageBps);
  if (!Number.isFinite(numeric)) {
    throw new InvalidRequestError('slippageBps must be a finite number');
  }
  if (numeric < JUPITER_MIN_SLIPPAGE_BPS || numeric > JUPITER_MAX_SLIPPAGE_BPS) {
    throw new InvalidRequestError(
      `slippageBps must be between ${JUPITER_MIN_SLIPPAGE_BPS} and ${JUPITER_MAX_SLIPPAGE_BPS}`,
      { slippageBps: numeric },
    );
  }
  return Math.round(numeric);
}

function describeSlippage({ slippageBps }) {
  return {
    slippageBps,
    slippagePct: slippageBps / 100,
  };
}

module.exports = {
  PAIR_CLASS_SLIPPAGE,
  classifyPair,
  clampSlippage,
  resolveSlippage,
  validateSlippageValue,
  describeSlippage,
};