/**
 * useSolanaWallet Hook
 *
 * Access the connected Solana wallet, its balance, and its link state
 * against the current SignalForge account. Combines the wallet adapter
 * with the Solana API so components do not have to touch both.
 *
 * @module client/src/hooks/useSolanaWallet
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet as useAdapterWallet } from '@solana/wallet-adapter-react';
import { solanaApi } from '../api/solana.api.js';
import { solanaUtil } from '../lib/utils/solana.util.js';
import { useAuth } from './useAuth.js';

export const solanaWalletKeys = {
  all: ['solana', 'wallets'],
  list: () => [...solanaWalletKeys.all, 'list'],
  primary: () => [...solanaWalletKeys.all, 'primary'],
  count: () => [...solanaWalletKeys.all, 'count'],
};

export function useSolanaWallet() {
  const { isAuthenticated } = useAuth();
  const adapter = useAdapterWallet();
  const queryClient = useQueryClient();

  const publicKeyString = useMemo(
    () => (adapter.publicKey ? adapter.publicKey.toBase58() : null),
    [adapter.publicKey],
  );

  const linkedWalletsQuery = useQuery({
    queryKey: solanaWalletKeys.list(),
    queryFn: () => solanaApi.listWallets(),
    enabled: isAuthenticated,
  });

  const primaryWalletQuery = useQuery({
    queryKey: solanaWalletKeys.primary(),
    queryFn: () => solanaApi.getPrimaryWallet(),
    enabled: isAuthenticated,
  });

  const connectMutation = useMutation({
    mutationFn: (payload) => solanaApi.completeWalletConnect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solanaWalletKeys.list() });
      queryClient.invalidateQueries({ queryKey: solanaWalletKeys.primary() });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: ({ walletId, reason }) =>
      solanaApi.disconnectWallet(walletId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solanaWalletKeys.list() });
      queryClient.invalidateQueries({ queryKey: solanaWalletKeys.primary() });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (walletId) => solanaApi.setPrimaryWallet(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solanaWalletKeys.list() });
      queryClient.invalidateQueries({ queryKey: solanaWalletKeys.primary() });
    },
  });

  const beginConnect = async () => {
    if (!publicKeyString) {
      throw new Error('No wallet connected');
    }
    return solanaApi.beginWalletConnect({ walletAddress: publicKeyString });
  };

  const completeConnect = async ({ message, signatureBase58, label, isPrimary }) => {
    if (!publicKeyString) {
      throw new Error('No wallet connected');
    }
    return connectMutation.mutateAsync({
      walletAddress: publicKeyString,
      message,
      signatureBase58,
      label,
      isPrimary,
    });
  };

  const isLinked = Boolean(
    publicKeyString &&
      linkedWalletsQuery.data &&
      linkedWalletsQuery.data.some((w) => w.walletAddress === publicKeyString),
  );

  return {
    connected: adapter.connected,
    connecting: adapter.connecting,
    publicKey: publicKeyString,
    shortAddress: publicKeyString ? solanaUtil.shortenAddress(publicKeyString) : '—',
    wallet: adapter.wallet,
    wallets: adapter.wallets,
    select: adapter.select,
    connect: adapter.connect,
    disconnect: adapter.disconnect,
    signMessage: adapter.signMessage,
    signTransaction: adapter.signTransaction,
    linkedWallets: linkedWalletsQuery.data || [],
    primaryWallet: primaryWalletQuery.data || null,
    isLinked,
    isLoading: linkedWalletsQuery.isLoading,
    beginConnect,
    completeConnect,
    disconnectFromAccount: disconnectMutation.mutateAsync,
    setPrimary: setPrimaryMutation.mutateAsync,
    isProcessing:
      connectMutation.isPending || disconnectMutation.isPending || setPrimaryMutation.isPending,
  };
}

export default useSolanaWallet;