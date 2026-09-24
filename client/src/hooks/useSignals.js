/**
 * useSignals Hook
 *
 * @module client/src/hooks/useSignals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalApi } from '../api/signal.api.js';
import { useAuth } from './useAuth.js';

export const signalKeys = {
  all: ['signals'],
  list: (params) => [...signalKeys.all, 'list', params],
  live: (params) => [...signalKeys.all, 'live', params],
  history: (params) => [...signalKeys.all, 'history', params],
  details: (signalId) => [...signalKeys.all, 'details', signalId],
  timeline: (signalId) => [...signalKeys.all, 'timeline', signalId],
  confidence: (signalId) => [...signalKeys.all, 'confidence', signalId],
  risk: (signalId) => [...signalKeys.all, 'risk', signalId],
  duplicates: (params) => [...signalKeys.all, 'duplicates', params],
  consensus: (params) => [...signalKeys.all, 'consensus', params],
  rejected: (params) => [...signalKeys.all, 'rejected', params],
};

export function useSignals(params = {}) {
  const { isAuthenticated } = useAuth();

  const listQuery = useQuery({
    queryKey: signalKeys.list(params),
    queryFn: () => signalApi.list(params),
    enabled: isAuthenticated,
  });

  const liveQuery = useQuery({
    queryKey: signalKeys.live(params),
    queryFn: () => signalApi.listLive(params),
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const duplicatesQuery = useQuery({
    queryKey: signalKeys.duplicates(params),
    queryFn: () => signalApi.listDuplicates(params),
    enabled: isAuthenticated,
  });

  const consensusQuery = useQuery({
    queryKey: signalKeys.consensus(params),
    queryFn: () => signalApi.listConsensus(params),
    enabled: isAuthenticated,
  });

  const rejectedQuery = useQuery({
    queryKey: signalKeys.rejected(params),
    queryFn: () => signalApi.listRejected(params),
    enabled: isAuthenticated,
  });

  return {
    signals: listQuery.data || [],
    liveSignals: liveQuery.data || [],
    duplicates: duplicatesQuery.data || [],
    consensus: consensusQuery.data || [],
    rejected: rejectedQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}

export function useSignal(signalId) {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: signalKeys.details(signalId),
    queryFn: () => signalApi.get(signalId),
    enabled: Boolean(signalId),
  });

  const timelineQuery = useQuery({
    queryKey: signalKeys.timeline(signalId),
    queryFn: () => signalApi.getTimeline(signalId),
    enabled: Boolean(signalId),
  });

  const confidenceQuery = useQuery({
    queryKey: signalKeys.confidence(signalId),
    queryFn: () => signalApi.getConfidence(signalId),
    enabled: Boolean(signalId),
  });

  const riskQuery = useQuery({
    queryKey: signalKeys.risk(signalId),
    queryFn: () => signalApi.getRisk(signalId),
    enabled: Boolean(signalId),
  });

  const replayMutation = useMutation({
    mutationFn: () => signalApi.replay(signalId),
  });

  return {
    signal: detailsQuery.data,
    timeline: timelineQuery.data || [],
    confidence: confidenceQuery.data,
    risk: riskQuery.data,
    isLoading: detailsQuery.isLoading,
    error: detailsQuery.error,
    replay: replayMutation.mutateAsync,
    isReplaying: replayMutation.isPending,
    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: signalKeys.details(signalId) });
      queryClient.invalidateQueries({ queryKey: signalKeys.timeline(signalId) });
    },
  };
}

export default useSignals;