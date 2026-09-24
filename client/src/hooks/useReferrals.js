/**
 * useReferrals Hook
 *
 * Manages everything the referral dashboard needs: the referral code,
 * network, rewards, wallet, and settlement history.
 *
 * @module client/src/hooks/useReferrals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { referralApi } from '../api/referral.api.js';

const QUERY_KEY = ['referrals'];

export function useReferralSummary({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'summary'],
    queryFn: () => referralApi.getSummary(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useReferralLink({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'link'],
    queryFn: () => referralApi.getLink(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReferredUsers({ page = 1, limit = 20, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'users', { page, limit }],
    queryFn: () => referralApi.listReferredUsers({ page, limit }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useReferralRewards({ page = 1, limit = 20, status, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'rewards', { page, limit, status }],
    queryFn: () => referralApi.listRewards({ page, limit, status }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useReferralWallet({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'wallet'],
    queryFn: () => referralApi.getWallet(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useReferralSettlements({ page = 1, limit = 20, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'settlements', { page, limit }],
    queryFn: () => referralApi.listSettlements({ page, limit }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReferralLeaderboard({ limit = 10, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'leaderboard', { limit }],
    queryFn: () => referralApi.getLeaderboard({ limit }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequestReferralWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => referralApi.requestWithdrawal(payload),
    onSuccess: () => {
      toast.success('Withdrawal request submitted');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'wallet'] });
    },
    onError: (error) => {
      const message = error?.response?.data?.error?.message || 'Failed to submit withdrawal request';
      toast.error(message);
    },
  });
}