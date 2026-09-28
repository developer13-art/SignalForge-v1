/**
 * Solana Context
 *
 * Wraps the Solana wallet adapter in a SignalForge-specific context.
 * Exposes the connection, the currently selected wallet, a compact
 * summary of the wallet state, and the helpers the UI needs to sign
 * SIWS messages and to submit transactions.
 *
 * The Solana wallet-adapter is mounted here, once, for the whole
 * application. `SolanaProvider` renders the adapter's ConnectionProvider
 * and WalletProvider around its children, then reads the adapter state
 * from a child component (where useWallet() is valid).
 *
 * @module client/src/context/SolanaContext
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import toast from 'react-hot-toast';

const SolanaContext = createContext(null);

function resolveRpcEndpoint() {
  const configured = import.meta?.env?.VITE_SOLANA_RPC_URL;
  if (configured) {
    return configured;
  }
  const network = import.meta?.env?.VITE_SOLANA_NETWORK || 'devnet';
  if (network === 'mainnet-beta' || network === 'mainnet') {
    return clusterApiUrl('mainnet-beta');
  }
  if (network === 'testnet') {
    return clusterApiUrl('testnet');
  }
  return clusterApiUrl('devnet');
}

function resolveAutoConnect() {
  const value = import.meta?.env?.VITE_SOLANA_WALLET_AUTO_CONNECT;
  if (value === 'true') {
    return true;
  }
  return false;
}

/**
 * Inner provider. This component is a child of the Solana wallet
 * adapter's providers, so useConnection() and useWallet() are valid
 * here.
 */
function SolanaStateProvider({ children }) {
  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    disconnect,
    sendTransaction,
    signMessage,
    signTransaction,
    wallet,
    wallets,
    select,
  } = useWallet();

  const walletAddress = useMemo(
    () => (publicKey ? publicKey.toBase58() : null),
    [publicKey],
  );

  const shortAddress = useMemo(() => {
    if (!walletAddress) {
      return null;
    }
    return `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
  }, [walletAddress]);

  const disconnectSafely = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      toast.error(error?.message || 'Failed to disconnect wallet');
    }
  }, [disconnect]);

  const selectWallet = useCallback(
    (walletName) => {
      const target = wallets.find((entry) => entry.adapter.name === walletName);
      if (!target) {
        toast.error(`Wallet ${walletName} is not available`);
        return;
      }
      try {
        select(target.adapter.name);
      } catch (error) {
        toast.error(error?.message || 'Failed to select wallet');
      }
    },
    [select, wallets],
  );

  const value = useMemo(
    () => ({
      connection,
      publicKey: publicKey || null,
      walletAddress,
      shortAddress,
      connected,
      connecting,
      disconnecting,
      disconnect: disconnectSafely,
      sendTransaction,
      signMessage,
      signTransaction,
      wallet: wallet || null,
      wallets,
      select: selectWallet,
      available: wallets.length > 0,
    }),
    [
      connection,
      publicKey,
      walletAddress,
      shortAddress,
      connected,
      connecting,
      disconnecting,
      disconnectSafely,
      sendTransaction,
      signMessage,
      signTransaction,
      wallet,
      wallets,
      selectWallet,
    ],
  );

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
}

/**
 * Public provider. Mounts the Solana wallet adapter once for the
 * application, then delegates state management to SolanaStateProvider.
 */
export function SolanaProvider({ children }) {
  const endpoint = useMemo(() => resolveRpcEndpoint(), []);
  const autoConnect = useMemo(() => resolveAutoConnect(), []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={autoConnect}>
        <SolanaStateProvider>{children}</SolanaStateProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useSolana() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used inside a SolanaProvider');
  }
  return context;
}

export default SolanaContext;