/**
 * Wallet Adapter Configuration
 *
 * Builds the list of supported Solana wallets for the wallet adapter
 * React provider. Wallets that are not installed are still listed and
 * prompt the user to install them.
 *
 * @module client/src/lib/solana/wallet-adapter
 */

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export function getWalletAdapters() {
  const network = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet');

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
    new TorusWalletAdapter(),
  ];

  return wallets;
}

export default getWalletAdapters;