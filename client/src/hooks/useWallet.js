/**
 * useWallet Hook
 *
 * @module client/src/hooks/useWallet
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api.js';
import { withdrawalApi } from '../api/withdrawal.api.js';
import { useAuth } from './useAuth.js';

export const walletKeys = {
  all: ['wallet'],
  overview: () => [...walletKeys.all, 'overview'],
  balance: () => [...walletKeys.all, 'balance'],
  ledger: (params) => [...walletKeys.all, 'ledger', params],
  transactions: (params) => [...walletKeys.all, 'transactions', params],
  paymentAccounts: () => [...walletKeys.all, 'payment-accounts'],
  withdrawals: (params) => [...walletKeys.all, 'withdrawals', params],
};

export function useWallet() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: walletKeys.overview(),
    queryFn: () => walletApi.getOverview(),
    enabled: isAuthenticated,
  });

  const balanceQuery = useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => walletApi.getBalance(),
    enabled: isAuthenticated,
  });

  const paymentAccountsQuery = useQuery({
    queryKey: walletKeys.paymentAccounts(),
    queryFn: () => walletApi.listPaymentAccounts(),
    enabled: isAuthenticated,
  });

  const addPaymentAccountMutation = useMutation({
    mutationFn: (payload) => walletApi.addPaymentAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.paymentAccounts() });
    },
  });

  const requestWithdrawalMutation = useMutation({
    mutationFn: (payload) => withdrawalApi.createWithdrawal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.overview() });
      queryClient.invalidateQueries({ queryKey: walletKeys.balance() });
      queryClient.invalidateQueries({ queryKey: walletKeys.withdrawals({}) });
    },
  });

  return {
    overview: overviewQuery.data,
    balance: balanceQuery.data,
    paymentAccounts: paymentAccountsQuery.data || [],
    isLoading: overviewQuery.isLoading,
    error: overviewQuery.error,
    addPaymentAccount: addPaymentAccountMutation.mutateAsync,
    requestWithdrawal: requestWithdrawalMutation.mutateAsync,
    isProcessing: addPaymentAccountMutation.isPending || requestWithdrawalMutation.isPending,
  };
}

export default useWallet;