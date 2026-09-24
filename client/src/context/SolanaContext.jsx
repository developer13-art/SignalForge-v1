/**
 * Solana Context
 *
 * Wraps the Solana wallet adapter in a SignalForge-specific context.
 * Exposes the connection, the currently selected wallet, a compact
 * summary of the wallet state, and the helpers the UI needs to sign
 * SIWS messages and to submit transactions.
 *
 * @module client/src/context/SolanaContext
 */

import { createContext, useContext, useMemo, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

const SolanaContext = createContext(null);

export function SolanaProvider({ children }) {
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

  const walletAddress = useMemo(() => (publicKey ? publicKey.toBase58() : null), [publicKey]);

  const shortAddress = useMemo(() => {
    if (!walletAddress) {
      return null;
    }
    return `${walletAddress.substring(0, 4)}…${walletAddress.substring(walletAddress.length - 4)}`;
  }, [walletAddress]);

  const signSiwsMessage = useCallback(
    async (message) => {
      if (!signMessage) {
        throw new Error('Wallet does not support message signing');
      }

      const encoded = new TextEncoder().encode(message);
      const signature = await signMessage(encoded);

      return {
        signatureBase58: toBase58(signature),
        message,
        walletAddress,
      };
    },
    [signMessage, walletAddress],
  );

  const submitTransaction = useCallback(
    async (transaction, options = {}) => {
      if (!connected || !publicKey) {
        toast.error('Connect a Solana wallet first');
        throw new Error('Wallet not connected');
      }

      const signature = await sendTransaction(transaction, connection, options);
      toast.success('Transaction submitted');
      return signature;
    },
    [connected, publicKey, sendTransaction, connection],
  );

  const value = useMemo(
    () => ({
      connection,
      wallet,
      wallets,
      select,
      publicKey,
      walletAddress,
      shortAddress,
      connected,
      connecting,
      disconnecting,
      disconnect,
      signMessage,
      signTransaction,
      signSiwsMessage,
      submitTransaction,
    }),
    [
      connection,
      wallet,
      wallets,
      select,
      publicKey,
      walletAddress,
      shortAddress,
      connected,
      connecting,
      disconnecting,
      disconnect,
      signMessage,
      signTransaction,
      signSiwsMessage,
      submitTransaction,
    ],
  );

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
}

function toBase58(bytes) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits = [0];
  for (let i = 0; i < bytes.length; i += 1) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j += 1) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = '';
  for (let i = bytes.length - 1; i >= 0 && bytes[i] === 0; i -= 1) {
    result += '1';
  }
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    result += alphabet[digits[i]];
  }
  return result;
}

export function useSolanaContext() {
  const ctx = useContext(SolanaContext);
  if (!ctx) {
    throw new Error('useSolanaContext must be used within a SolanaProvider');
  }
  return ctx;
}

export { SolanaContext };
export default SolanaContext;