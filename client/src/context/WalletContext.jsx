/**
 * Wallet Context
 *
 * Manages the SignalForge wallet: available balance, pending balance,
 * ledger entries, and withdrawal flow. Kept independent of the auth
 * context so the wallet can be refreshed without a full session
 * refetch.
 *
 * @module client/src/context/WalletContext
 */

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { walletApi } from '../api/wallet.api.js';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wallet', 'overview'],
    queryFn: () => walletApi.getOverview(),
    staleTime: 60 * 1000,
  });

  const requestWithdrawal = useMutation({
    mutationFn: (payload) => walletApi.requestWithdrawal(payload),
    onSuccess: () => {
      toast.success('Withdrawal request submitted');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error) => {
      const message = error?.response?.data?.error?.message || 'Failed to submit withdrawal';
      toast.error(message);
    },
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const value = useMemo(() => {
    const overview = data || {};
    return {
      availableBalance: overview.availableBalance || 0,
      pendingBalance: overview.pendingBalance || 0,
      currency: overview.currency || 'USD',
      ledger: overview.ledger || [],
      isLoading,
      refresh,
      requestWithdrawal,
    };
  }, [data, isLoading, refresh, requestWithdrawal]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return ctx;
}

export { WalletContext };
export default WalletContext;