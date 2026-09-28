'use strict';

/**
 * SignalForge - Pair Mappings
 *
 * Alternate phrasings for crypto pairs that the AI parser and pair
 * mapper must accept. Every mapping resolves to a canonical pair.
 */

const PAIR_ALIASES = Object.freeze({
  'BTC/USDT': ['BTCUSDT', 'BTC-USDT', 'BTC_USDT', 'BITCOIN', 'XBTUSD', 'BTCUSD', 'BTC/USD'],
  'ETH/USDT': ['ETHUSDT', 'ETH-USDT', 'ETH_USDT', 'ETHEREUM', 'ETHUSD', 'ETH/USD'],
  'SOL/USDT': ['SOLUSDT', 'SOL-USDT', 'SOL_USDT', 'SOLANA', 'SOLUSD', 'SOL/USD'],
  'BNB/USDT': ['BNBUSDT', 'BNB-USDT', 'BNB_USDT', 'BINANCECOIN'],
  'XRP/USDT': ['XRPUSDT', 'XRP-USDT', 'XRP_USDT', 'RIPPLE'],
  'ADA/USDT': ['ADAUSDT', 'ADA-USDT', 'ADA_USDT', 'CARDANO'],
  'DOGE/USDT': ['DOGEUSDT', 'DOGE-USDT', 'DOGE_USDT', 'DOGECOIN'],
  'AVAX/USDT': ['AVAXUSDT', 'AVAX-USDT', 'AVAX_USDT'],
  'DOT/USDT': ['DOTUSDT', 'DOT-USDT', 'DOT_USDT', 'POLKADOT'],
  'POL/USDT': ['POLUSDT', 'POL-USDT', 'POL_USDT', 'MATIC', 'MATICUSDT', 'POLYGON'],
  'LINK/USDT': ['LINKUSDT', 'LINK-USDT', 'LINK_USDT', 'CHAINLINK'],
  'UNI/USDT': ['UNIUSDT', 'UNI-USDT', 'UNI_USDT', 'UNISWAP'],
  'ATOM/USDT': ['ATOMUSDT', 'ATOM-USDT', 'ATOM_USDT', 'COSMOS'],
  'LTC/USDT': ['LTCUSDT', 'LTC-USDT', 'LTC_USDT', 'LITECOIN'],
  'BCH/USDT': ['BCHUSDT', 'BCH-USDT', 'BCH_USDT', 'BITCOINCASH'],
  'NEAR/USDT': ['NEARUSDT', 'NEAR-USDT', 'NEAR_USDT'],
  'APT/USDT': ['APTUSDT', 'APT-USDT', 'APT_USDT', 'APTOS'],
  'ARB/USDT': ['ARBUSDT', 'ARB-USDT', 'ARB_USDT', 'ARBITRUM'],
  'OP/USDT': ['OPUSDT', 'OP-USDT', 'OP_USDT', 'OPTIMISM'],
  'INJ/USDT': ['INJUSDT', 'INJ-USDT', 'INJ_USDT', 'INJECTIVE'],
  'SUI/USDT': ['SUIUSDT', 'SUI-USDT', 'SUI_USDT'],
  'SEI/USDT': ['SEIUSDT', 'SEI-USDT', 'SEI_USDT'],
  'TIA/USDT': ['TIAUSDT', 'TIA-USDT', 'TIA_USDT', 'CELESTIA'],
  'JUP/USDT': ['JUPUSDT', 'JUP-USDT', 'JUP_USDT', 'JUPITER'],
  'WIF/USDT': ['WIFUSDT', 'WIF-USDT', 'WIF_USDT', 'DOGWIFHAT'],
  'BONK/USDT': ['BONKUSDT', 'BONK-USDT', 'BONK_USDT'],
  'PYTH/USDT': ['PYTHUSDT', 'PYTH-USDT', 'PYTH_USDT'],
  'RAY/USDT': ['RAYUSDT', 'RAY-USDT', 'RAY_USDT', 'RAYDIUM'],
  'ORCA/USDT': ['ORCAUSDT', 'ORCA-USDT', 'ORCA_USDT'],
  'MEME/USDT': ['MEMEUSDT', 'MEME-USDT', 'MEME_USDT'],
  'PEPE/USDT': ['PEPEUSDT', 'PEPE-USDT', 'PEPE_USDT'],
  'SHIB/USDT': ['SHIBUSDT', 'SHIB-USDT', 'SHIB_USDT', 'SHIBAINU'],
  'FIL/USDT': ['FILUSDT', 'FIL-USDT', 'FIL_USDT', 'FILECOIN'],
  'AAVE/USDT': ['AAVEUSDT', 'AAVE-USDT', 'AAVE_USDT'],
  'MKR/USDT': ['MKRUSDT', 'MKR-USDT', 'MKR_USDT', 'MAKER'],
  'CRV/USDT': ['CRVUSDT', 'CRV-USDT', 'CRV_USDT', 'CURVE'],
  'SNX/USDT': ['SNXUSDT', 'SNX-USDT', 'SNX_USDT', 'SYNTHETIX'],
  'GRT/USDT': ['GRTUSDT', 'GRT-USDT', 'GRT_USDT', 'THEGRAPH'],
  'RNDR/USDT': ['RNDRUSDT', 'RNDR-USDT', 'RNDR_USDT', 'RENDER'],
  'FET/USDT': ['FETUSDT', 'FET-USDT', 'FET_USDT', 'FETCHAI'],
  'IMX/USDT': ['IMXUSDT', 'IMX-USDT', 'IMX_USDT', 'IMMUTABLE'],
  'STX/USDT': ['STXUSDT', 'STX-USDT', 'STX_USDT', 'STACKS'],
  'BTC/USDC': ['BTCUSDC', 'BTC-USDC', 'BTC_USDC'],
  'ETH/USDC': ['ETHUSDC', 'ETH-USDC', 'ETH_USDC'],
  'SOL/USDC': ['SOLUSDC', 'SOL-USDC', 'SOL_USDC'],
  'BTC/USD': ['BTCUSD', 'XBTUSD'],
  'ETH/USD': ['ETHUSD'],
  'SOL/USD': ['SOLUSD'],
});

const QUOTE_ALIASES = Object.freeze({
  USDT: ['TETHER', 'TETHERUS'],
  USDC: ['USDCOIN', 'USDC.E'],
  USD: ['DOLLAR', 'USDOLLAR'],
  BTC: ['XBT'],
  ETH: ['ETHER'],
  SOL: ['SOLANA'],
});

const PERP_ALIASES = Object.freeze({
  PERP: ['PERPETUAL', 'PERPS'],
  SWAP: ['PERPSWAP', 'PERPETUALSWAP'],
});

function buildReverseIndex() {
  const index = {};
  for (const [canonical, aliases] of Object.entries(PAIR_ALIASES)) {
    index[canonical.toUpperCase()] = canonical;
    for (const alias of aliases) {
      index[alias.toUpperCase()] = canonical;
    }
  }
  return index;
}

const PAIR_ALIAS_INDEX = Object.freeze(buildReverseIndex());

function resolveCanonicalPair(input) {
  if (!input) {
    return null;
  }
  const normalized = String(input).trim().toUpperCase().replace(/\s+/g, '');
  return PAIR_ALIAS_INDEX[normalized] || null;
}

function listAliases(canonical) {
  if (!canonical) {
    return [];
  }
  const upper = String(canonical).trim().toUpperCase();
  const direct = PAIR_ALIASES[upper];
  if (!direct) {
    return [];
  }
  return [upper, ...direct];
}

function listAllAliases() {
  return { ...PAIR_ALIASES };
}

function describeMapping(canonical) {
  const aliases = listAliases(canonical);
  return {
    canonical,
    aliases,
    aliasCount: aliases.length,
  };
}

module.exports = Object.freeze({
  PAIR_ALIASES,
  QUOTE_ALIASES,
  PERP_ALIASES,
  PAIR_ALIAS_INDEX,
  resolveCanonicalPair,
  listAliases,
  listAllAliases,
  describeMapping,
});