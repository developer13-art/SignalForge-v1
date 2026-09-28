'use strict';

const {
  SLIPPAGE_POLICY,
  SHARED_DEFAULTS,
  SHARED_ERROR_CODES,
} = require('./shared.constants');

/**
 * SignalForge - Shared Slippage Service
 *
 * Gateway-neutral slippage resolution. Supports three policies:
 * static (fixed value), dynamic (pair-class based), and auto (best of
 * both, bounded by a maximum).
 */

class SlippageError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.INVALID_REQUEST) {
    super(message);
    this.name = 'SlippageError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

const PAIR_CLASS_SLIPPAGE = Object.freeze({
  stable_stable: 5,
  major_major: 10,
  major_alt: 25,
  alt_alt: 50,
  meme_alt: 100,
  low_liquidity: 300,
});

const STABLE_SYMBOLS = new Set(['USDC', 'USDT', 'DAI', 'USDE', 'FDUSD', 'PYUSD', 'TUSD']);
const MAJOR_SYMBOLS = new Set(['SOL', 'WSOL', 'BTC', 'WBTC', 'ETH', 'WETH', 'JUP', 'RAY', 'ORCA']);
const MEME_SYMBOLS = new Set(['BONK', 'WIF', 'MEME', 'PEPE', 'SHIB']);

function clampSlippage(bps) {
  const numeric = Number(bps);
  if (!Number.isFinite(numeric)) {
    return SHARED_DEFAULTS.SLIPPAGE_BPS;
  }
  const minimum = 1;
  const maximum = SHARED_DEFAULTS.MAX_SLIPPAGE_BPS;
  if (numeric < minimum) {
    return minimum;
  }
  if (numeric > maximum) {
    return maximum;
  }
  return Math.round(numeric);
}

function classifyPair(inputSymbol, outputSymbol) {
  const input = (inputSymbol || '').toUpperCase();
  const output = (outputSymbol || '').toUpperCase();

  const inputStable = STABLE_SYMBOLS.has(input);
  const outputStable = STABLE_SYMBOLS.has(output);
  const inputMajor = MAJOR_SYMBOLS.has(input);
  const outputMajor = MAJOR_SYMBOLS.has(output);
  const inputMeme = MEME_SYMBOLS.has(input);
  const outputMeme = MEME_SYMBOLS.has(output);

  if (inputStable && outputStable) {
    return 'stable_stable';
  }
  if (inputMajor && outputMajor) {
    return 'major_major';
  }
  if ((inputMajor && !outputMajor && !outputStable) || (outputMajor && !inputMajor && !inputStable)) {
    return 'major_alt';
  }
  if (inputMeme || outputMeme) {
    return 'meme_alt';
  }
  return 'alt_alt';
}

function resolveStaticSlippage({ userBps, policyBps, fallbackBps } = {}) {
  const candidates = [];
  if (userBps !== undefined && userBps !== null) {
    candidates.push(clampSlippage(userBps));
  }
  if (policyBps !== undefined && policyBps !== null) {
    candidates.push(clampSlippage(policyBps));
  }
  if (fallbackBps !== undefined && fallbackBps !== null) {
    candidates.push(clampSlippage(fallbackBps));
  }
  candidates.push(SHARED_DEFAULTS.SLIPPAGE_BPS);
  return clampSlippage(Math.max(...candidates));
}

function resolveDynamicSlippage({ inputSymbol, outputSymbol, volumeHint } = {}) {
  const pairClass = classifyPair(inputSymbol, outputSymbol);
  const base = PAIR_CLASS_SLIPPAGE[pairClass] || SHARED_DEFAULTS.SLIPPAGE_BPS;

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

  return {
    slippageBps: clampSlippage(base + volumeAdjustment),
    pairClass,
    base,
    volumeAdjustment,
  };
}

function resolveSlippage({
  policy = SLIPPAGE_POLICY.AUTO,
  userBps,
  policyBps,
  inputSymbol,
  outputSymbol,
  volumeHint,
  maxBps,
} = {}) {
  let resolved;

  if (policy === SLIPPAGE_POLICY.STATIC) {
    resolved = {
      slippageBps: resolveStaticSlippage({ userBps, policyBps }),
      pairClass: null,
      base: null,
      volumeAdjustment: 0,
    };
  } else if (policy === SLIPPAGE_POLICY.DYNAMIC) {
    resolved = resolveDynamicSlippage({ inputSymbol, outputSymbol, volumeHint });
  } else {
    const staticResult = resolveStaticSlippage({ userBps, policyBps });
    const dynamicResult = resolveDynamicSlippage({ inputSymbol, outputSymbol, volumeHint });
    const combined = clampSlippage(Math.max(staticResult, dynamicResult.slippageBps));
    resolved = {
      slippageBps: combined,
      pairClass: dynamicResult.pairClass,
      base: dynamicResult.base,
      volumeAdjustment: dynamicResult.volumeAdjustment,
      static: staticResult,
    };
  }

  if (maxBps !== undefined && maxBps !== null) {
    resolved.slippageBps = clampSlippage(Math.min(resolved.slippageBps, maxBps));
  }

  return resolved;
}

function describeSlippage({ slippageBps }) {
  return {
    slippageBps,
    slippagePct: slippageBps / 100,
  };
}

function validateSlippage(bps) {
  const numeric = Number(bps);
  if (!Number.isFinite(numeric)) {
    throw new SlippageError('slippageBps must be a finite number');
  }
  if (numeric < 1 || numeric > SHARED_DEFAULTS.MAX_SLIPPAGE_BPS) {
    throw new SlippageError(
      `slippageBps must be between 1 and ${SHARED_DEFAULTS.MAX_SLIPPAGE_BPS}`,
    );
  }
  return Math.round(numeric);
}

module.exports = {
  SlippageError,
  PAIR_CLASS_SLIPPAGE,
  clampSlippage,
  classifyPair,
  resolveStaticSlippage,
  resolveDynamicSlippage,
  resolveSlippage,
  describeSlippage,
  validateSlippage,
};