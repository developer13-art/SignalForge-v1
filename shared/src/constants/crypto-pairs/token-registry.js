'use strict';

/**
 * SignalForge - Token Registry
 *
 * Canonical metadata for every SPL token and quote asset the platform
 * supports. Used by the frontend to render token icons and by the
 * backend to resolve decimals.
 */

const TOKEN_REGISTRY = Object.freeze({
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tags: ['stable', 'major'],
    logo: '/assets/tokens/usdc.svg',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    tags: ['stable', 'major'],
    logo: '/assets/tokens/usdt.svg',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 9,
    mint: 'EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o',
    tags: ['stable'],
    logo: '/assets/tokens/dai.svg',
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112',
    tags: ['major'],
    logo: '/assets/tokens/sol.svg',
  },
  WSOL: {
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112',
    tags: ['wrapped', 'major'],
    logo: '/assets/tokens/sol.svg',
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin (Wormhole)',
    decimals: 8,
    mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    tags: ['major'],
    logo: '/assets/tokens/btc.svg',
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    tags: ['major', 'wrapped'],
    logo: '/assets/tokens/btc.svg',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum (Wormhole)',
    decimals: 8,
    mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    tags: ['major'],
    logo: '/assets/tokens/eth.svg',
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 8,
    mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    tags: ['major', 'wrapped'],
    logo: '/assets/tokens/eth.svg',
  },
  JUP: {
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    tags: ['governance'],
    logo: '/assets/tokens/jup.svg',
  },
  BONK: {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    tags: ['meme'],
    logo: '/assets/tokens/bonk.svg',
  },
  PYTH: {
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    tags: ['governance'],
    logo: '/assets/tokens/pyth.svg',
  },
  RAY: {
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    tags: ['governance'],
    logo: '/assets/tokens/ray.svg',
  },
  ORCA: {
    symbol: 'ORCA',
    name: 'Orca',
    decimals: 6,
    mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    tags: ['governance'],
    logo: '/assets/tokens/orca.svg',
  },
  WIF: {
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6,
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    tags: ['meme'],
    logo: '/assets/tokens/wif.svg',
  },
  JTO: {
    symbol: 'JTO',
    name: 'Jito',
    decimals: 9,
    mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    tags: ['governance', 'lst'],
    logo: '/assets/tokens/jto.svg',
  },
  mSOL: {
    symbol: 'mSOL',
    name: 'Marinade staked SOL',
    decimals: 9,
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    tags: ['lst'],
    logo: '/assets/tokens/msol.svg',
  },
  JitoSOL: {
    symbol: 'JitoSOL',
    name: 'Jito staked SOL',
    decimals: 9,
    mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
    tags: ['lst'],
    logo: '/assets/tokens/jitosol.svg',
  },
});

const TOKEN_SYMBOL_INDEX = Object.freeze(
  Object.values(TOKEN_REGISTRY).reduce((acc, token) => {
    acc[token.symbol.toUpperCase()] = token;
    return acc;
  }, {}),
);

const TOKEN_MINT_INDEX = Object.freeze(
  Object.values(TOKEN_REGISTRY).reduce((acc, token) => {
    acc[token.mint] = token;
    return acc;
  }, {}),
);

function findTokenBySymbol(symbol) {
  if (!symbol) {
    return null;
  }
  const normalized = String(symbol).trim().toUpperCase();
  return TOKEN_SYMBOL_INDEX[normalized] || null;
}

function findTokenByMint(mint) {
  if (!mint) {
    return null;
  }
  return TOKEN_MINT_INDEX[mint] || null;
}

function resolveDecimals(symbolOrMint) {
  const token = findTokenBySymbol(symbolOrMint) || findTokenByMint(symbolOrMint);
  return token ? token.decimals : null;
}

function listTokens() {
  return Object.values(TOKEN_REGISTRY);
}

function listTokensByTag(tag) {
  if (!tag) {
    return [];
  }
  return listTokens().filter((token) => token.tags.includes(tag));
}

module.exports = Object.freeze({
  TOKEN_REGISTRY,
  TOKEN_SYMBOL_INDEX,
  TOKEN_MINT_INDEX,
  findTokenBySymbol,
  findTokenByMint,
  resolveDecimals,
  listTokens,
  listTokensByTag,
});