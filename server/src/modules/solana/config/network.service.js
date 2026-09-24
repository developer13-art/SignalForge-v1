/**
 * Network Service
 *
 * Resolves the current Solana network, RPC endpoints, and network-
 * specific details for the platform. All values come from the
 * platform config module so that environments can override them.
 *
 * @module server/modules/solana/config/network.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { config } from '../../../config';
import {
  SOLANA_NETWORKS,
  SOLANA_NETWORK_VALUES,
  isValidNetwork,
} from '../solana.constants';

const DEFAULT_RPC_URLS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET_BETA]: 'https://api.mainnet-beta.solana.com',
  [SOLANA_NETWORKS.DEVNET]: 'https://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'https://api.testnet.solana.com',
  [SOLANA_NETWORKS.LOCALNET]: 'http://localhost:8899',
});

const DEFAULT_WS_URLS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET_BETA]: 'wss://api.mainnet-beta.solana.com',
  [SOLANA_NETWORKS.DEVNET]: 'wss://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'wss://api.testnet.solana.com',
  [SOLANA_NETWORKS.LOCALNET]: 'ws://localhost:8900',
});

function readConfiguredNetwork() {
  const network = config.solana && config.solana.network;
  if (!network) {
    return SOLANA_NETWORKS.DEVNET;
  }
  if (!isValidNetwork(network)) {
    throw new AppError(
      `Invalid Solana network: ${network}`,
      ERROR_CODES.CONFIGURATION_INVALID,
      500,
    );
  }
  return network;
}

export function getCurrentNetwork() {
  return readConfiguredNetwork();
}

export function getNetworkInfo() {
  const network = readConfiguredNetwork();

  const rpcUrl = (config.solana && config.solana.rpcUrl) || DEFAULT_RPC_URLS[network];
  const wsUrl = (config.solana && config.solana.wsUrl) || DEFAULT_WS_URLS[network];

  return {
    network,
    rpcUrl,
    wsUrl,
    isMainnet: network === SOLANA_NETWORKS.MAINNET_BETA,
    isDevnet: network === SOLANA_NETWORKS.DEVNET,
    isLocalnet: network === SOLANA_NETWORKS.LOCALNET,
    availableNetworks: SOLANA_NETWORK_VALUES,
  };
}

export function getRpcUrl() {
  return getNetworkInfo().rpcUrl;
}

export function getWsUrl() {
  return getNetworkInfo().wsUrl;
}

export function getExplorerBaseUrl() {
  const network = readConfiguredNetwork();

  if (network === SOLANA_NETWORKS.MAINNET_BETA) {
    return 'https://explorer.solana.com';
  }

  return `https://explorer.solana.com/?cluster=${network}`;
}

export function buildExplorerTxUrl({ txSignature }) {
  if (!txSignature) {
    return null;
  }

  const base = getExplorerBaseUrl();

  if (base.includes('?')) {
    return `${base}&tx=${txSignature}`;
  }

  return `${base}/tx/${txSignature}`;
}

export function buildExplorerAddressUrl({ address }) {
  if (!address) {
    return null;
  }

  const base = getExplorerBaseUrl();

  if (base.includes('?')) {
    return `${base}&address=${address}`;
  }

  return `${base}/address/${address}`;
}

export const networkService = {
  getCurrentNetwork,
  getNetworkInfo,
  getRpcUrl,
  getWsUrl,
  getExplorerBaseUrl,
  buildExplorerTxUrl,
  buildExplorerAddressUrl,
};