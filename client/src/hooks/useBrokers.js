/**
 * useBrokers Hook
 *
 * Provides broker account data and lifecycle helpers: listing the
 * user's connected accounts, fetching a single account, connecting a
 * new account, disconnecting an account, and manually triggering a
 * synchronization. Uses React Query for caching and invalidation.
 *
 * @module client/src/hooks/useBrokers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { brokerApi } from '../api/broker.api.js';

const QUERY_KEY = ['brokers'];

export function useBrokerAccounts({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list'],
    queryFn: () => brokerApi.listAccounts(),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useBrokerAccount(accountId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', accountId],
    queryFn: () => brokerApi.getAccount(accountId),
    enabled: enabled && Boolean(accountId),
    staleTime: 30 * 1000,
  });
}

export function useBrokerConnectionLogs(accountId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'logs', accountId],
    queryFn: () => brokerApi.getConnectionLogs(accountId),
    enabled: enabled && Boolean(accountId),
    staleTime: 60 * 1000,
  });
}

export function useConnectBroker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => brokerApi.connectAccount(payload),
    onSuccess: (data) => {
      toast.success(`Connected account ${data?.accountNickname || ''}`.trim());
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list'] });
    },
    onError: (error) => {
      const message = error?.response?.data?.error?.message || 'Failed to connect broker account';
      toast.error(message);
    },
  });
}

export function useDisconnectBroker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, reason }) => brokerApi.disconnectAccount(accountId, { reason }),
    onSuccess: () => {
      toast.success('Broker account disconnected');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list'] });
    },
    onError: () => {
      toast.error('Failed to disconnect broker account');
    },
  });
}

export function useSyncBrokerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId) => brokerApi.syncAccount(accountId),
    onSuccess: (_data, accountId) => {
      toast.success('Account synchronization scheduled');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'detail', accountId] });
    },
    onError: () => {
      toast.error('Failed to trigger synchronization');
    },
  });
}

export function useAccountSnapshots(accountId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'snapshots', accountId],
    queryFn: () => brokerApi.listSnapshots(accountId),
    enabled: enabled && Boolean(accountId),
    staleTime: 60 * 1000,
  });
}