/**
 * Wallet Configuration
 *
 * Configuration for the Solana wallet adapter layer: which wallets are
 * supported, how auto-connect behaves, and appearance defaults.
 *
 * @module client/src/config/wallet.config
 */

export const walletConfig = Object.freeze({
  autoConnect: true,
  network: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  supportedWallets: ['Phantom', 'Solflare', 'Backpack', 'Glow', 'Slope', 'Torus'],
  appearance: {
    theme: 'dark',
    accentColor: '#8B5CF6',
    borderRadius: '12px',
    modalZIndex: 1050,
  },
  labels: {
    connectButton: 'Connect Wallet',
    connectedButton: 'Wallet',
    signMessage: 'Sign message',
    signTransaction: 'Sign transaction',
    changeWallet: 'Change wallet',
    disconnect: 'Disconnect',
  },
});

export default walletConfig;