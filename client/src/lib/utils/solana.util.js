/**
 * Solana Utility
 *
 * Helpers for Solana-related client operations: address shortening,
 * explorer URLs, and symbol formatting.
 *
 * @module client/src/lib/utils/solana.util
 */

import { solanaConfig } from '../../config/solana.config.js';

export function shortenAddress(address, prefixLength = 4, suffixLength = 4) {
  if (!address || typeof address !== 'string') {
    return '—';
  }
  if (address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

export function shortenSignature(signature, prefixLength = 8, suffixLength = 8) {
  if (!signature || typeof signature !== 'string') {
    return '—';
  }
  if (signature.length <= prefixLength + suffixLength + 3) {
    return signature;
  }
  return `${signature.substring(0, prefixLength)}...${signature.substring(signature.length - suffixLength)}`;
}

export function getExplorerTxUrl(signature) {
  if (!signature) {
    return null;
  }
  const base = 'https://explorer.solana.com/tx';
  const network = solanaConfig.network;
  const param = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `${base}/${signature}${param}`;
}

export function getExplorerAddressUrl(address) {
  if (!address) {
    return null;
  }
  const base = 'https://explorer.solana.com/address';
  const network = solanaConfig.network;
  const param = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `${base}/${address}${param}`;
}

export function getTokenMint(token) {
  const tokens = solanaConfig.tokens;
  if (!tokens || !tokens[token]) {
    return null;
  }
  const entry = tokens[token];
  if (solanaConfig.network === 'mainnet-beta') {
    return entry.mainnetMint || null;
  }
  return entry.devnetMint || null;
}

export function getTokenDecimals(token) {
  const tokens = solanaConfig.tokens;
  return tokens && tokens[token] ? tokens[token].decimals : 0;
}

export function formatSolAmount(lamports) {
  const num = Number(lamports);
  if (!Number.isFinite(num)) {
    return '—';
  }
  return (num / 1_000_000_000).toFixed(4);
}

export const solanaUtil = {
  shortenAddress,
  shortenSignature,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  getTokenMint,
  getTokenDecimals,
  formatSolAmount,
};