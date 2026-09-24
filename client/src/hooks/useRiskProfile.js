/**
 * useRiskProfile Hook
 *
 * Manages the authenticated user's risk profile: fetching, updating,
 * and resetting to defaults. Also exposes a mutation to trigger the
 * emergency stop mechanism.
 *
 * @module client/src/hooks/useRiskProfile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { riskApi } from '../api/risk.api.js';

const QUERY_KEY = ['risk'];

export function useRiskProfile({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'profile'],
    queryFn: () => riskApi.getProfile(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useRiskEvents({ from, to, page = 1, limit = 20 } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'events', { from, to, page, limit }],
    queryFn: () => riskApi.listEvents({ from, to, page, limit }),
    staleTime: 30 * 1000,
  });
}

export function useUpdateRiskProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => riskApi.updateProfile(payload),
    onSuccess: () => {
      toast.success('Risk profile updated');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'profile'] });
    },
    onError: (error) => {
      const message = error?.response?.data?.error?.message || 'Failed to update risk profile';
      toast.error(message);
    },
  });
}

export function useResetRiskProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => riskApi.resetProfile(),
    onSuccess: () => {
      toast.success('Risk profile reset to defaults');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'profile'] });
    },
    onError: () => {
      toast.error('Failed to reset risk profile');
    },
  });
}

export function useEmergencyStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reason } = {}) => riskApi.triggerEmergencyStop({ reason }),
    onSuccess: () => {
      toast.success('Emergency stop activated — trading paused');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'profile'] });
    },
    onError: () => {
      toast.error('Failed to activate emergency stop');
    },
  });
}

export function useResumeFromEmergencyStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => riskApi.resumeFromEmergencyStop(),
    onSuccess: () => {
      toast.success('Trading resumed');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'profile'] });
    },
    onError: () => {
      toast.error('Failed to resume trading');
    },
  });
}