/**
 * Address Formatter
 *
 * @module client/src/lib/formatters/address.formatter
 */

export function shortenWalletAddress(address, prefixLength = 4, suffixLength = 4) {
  if (!address || typeof address !== 'string') {
    return '—';
  }
  if (address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

export function formatWalletAddress(address) {
  if (!address || typeof address !== 'string') {
    return '—';
  }
  return address.trim();
}

export function shortenTxSignature(signature, prefixLength = 8, suffixLength = 8) {
  if (!signature || typeof signature !== 'string') {
    return '—';
  }
  if (signature.length <= prefixLength + suffixLength + 3) {
    return signature;
  }
  return `${signature.substring(0, prefixLength)}...${signature.substring(signature.length - suffixLength)}`;
}

export function getSolanaExplorerUrl(signatureOrAddress, network = 'devnet') {
  if (!signatureOrAddress) {
    return null;
  }
  const base = 'https://explorer.solana.com';
  const networkParam = network === 'mainnet-beta' ? '' : `?cluster=${network}`;

  if (/^[0-9a-f]{64}$/i.test(signatureOrAddress) || signatureOrAddress.length >= 80) {
    return `${base}/tx/${signatureOrAddress}${networkParam}`;
  }

  return `${base}/address/${signatureOrAddress}${networkParam}`;
}

export const addressFormatter = {
  shortenWalletAddress,
  formatWalletAddress,
  shortenTxSignature,
  getSolanaExplorerUrl,
};