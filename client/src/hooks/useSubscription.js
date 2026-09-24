/**
 * useSubscription Hook
 *
 * @module client/src/hooks/useSubscription
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription.api.js';
import { useAuth } from './useAuth.js';

export const subscriptionKeys = {
  all: ['subscriptions'],
  plans: () => [...subscriptionKeys.all, 'plans'],
  current: () => [...subscriptionKeys.all, 'current'],
  usage: () => [...subscriptionKeys.all, 'usage'],
};

export function useSubscription() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionApi.listPlans(),
    staleTime: 5 * 60 * 1000,
  });

  const currentQuery = useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionApi.getCurrentSubscription(),
    enabled: isAuthenticated,
  });

  const usageQuery = useQuery({
    queryKey: subscriptionKeys.usage(),
    queryFn: () => subscriptionApi.getUsage(),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => subscriptionApi.createSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: (payload) => subscriptionApi.upgradeSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });

  const downgradeMutation = useMutation({
    mutationFn: (payload) => subscriptionApi.downgradeSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (payload) => subscriptionApi.cancelSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });

  const subscription = currentQuery.data;
  const isActive = Boolean(subscription && ['ACTIVE', 'TRIAL'].includes(subscription.status));
  const canExecuteTrades = Boolean(
    subscription && ['ACTIVE', 'TRIAL'].includes(subscription.status),
  );

  return {
    plans: plansQuery.data || [],
    subscription,
    usage: usageQuery.data,
    isActive,
    canExecuteTrades,
    isLoading: currentQuery.isLoading,
    error: currentQuery.error,
    create: createMutation.mutateAsync,
    upgrade: upgradeMutation.mutateAsync,
    downgrade: downgradeMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      upgradeMutation.isPending ||
      downgradeMutation.isPending ||
      cancelMutation.isPending,
  };
}

export default useSubscription;