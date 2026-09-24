/**
 * useTrades Hook
 *
 * @module client/src/hooks/useTrades
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from '../api/trade.api.js';
import { useAuth } from './useAuth.js';

export const tradeKeys = {
  all: ['trades'],
  list: (params) => [...tradeKeys.all, 'list', params],
  openPositions: (params) => [...tradeKeys.all, 'positions', params],
  position: (positionId) => [...tradeKeys.all, 'position', positionId],
  history: (params) => [...tradeKeys.all, 'history', params],
  details: (tradeId) => [...tradeKeys.all, 'details', tradeId],
  timeline: (tradeId) => [...tradeKeys.all, 'timeline', tradeId],
  events: (tradeId) => [...tradeKeys.all, 'events', tradeId],
  pending: (params) => [...tradeKeys.all, 'pending', params],
  shadow: (tradeId) => [...tradeKeys.all, 'shadow', tradeId],
};

export function useTrades(params = {}) {
  const { isAuthenticated } = useAuth();

  const listQuery = useQuery({
    queryKey: tradeKeys.list(params),
    queryFn: () => tradeApi.list(params),
    enabled: isAuthenticated,
  });

  const openPositionsQuery = useQuery({
    queryKey: tradeKeys.openPositions(params),
    queryFn: () => tradeApi.listOpenPositions(params),
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const historyQuery = useQuery({
    queryKey: tradeKeys.history(params),
    queryFn: () => tradeApi.listHistory(params),
    enabled: isAuthenticated,
  });

  const pendingOrdersQuery = useQuery({
    queryKey: tradeKeys.pending(params),
    queryFn: () => tradeApi.listPendingOrders(params),
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: ({ tradeId, payload }) => tradeApi.closeTrade(tradeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });

  const modifyMutation = useMutation({
    mutationFn: ({ tradeId, payload }) => tradeApi.modifyTrade(tradeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });

  return {
    trades: listQuery.data || [],
    openPositions: openPositionsQuery.data || [],
    history: historyQuery.data || [],
    pendingOrders: pendingOrdersQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    closeTrade: closeMutation.mutateAsync,
    modifyTrade: modifyMutation.mutateAsync,
    isProcessing: closeMutation.isPending || modifyMutation.isPending,
  };
}

export function useTrade(tradeId) {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: tradeKeys.details(tradeId),
    queryFn: () => tradeApi.getTrade(tradeId),
    enabled: Boolean(tradeId),
  });

  const timelineQuery = useQuery({
    queryKey: tradeKeys.timeline(tradeId),
    queryFn: () => tradeApi.getTimeline(tradeId),
    enabled: Boolean(tradeId),
  });

  const eventsQuery = useQuery({
    queryKey: tradeKeys.events(tradeId),
    queryFn: () => tradeApi.listEvents(tradeId),
    enabled: Boolean(tradeId),
  });

  const shadowQuery = useQuery({
    queryKey: tradeKeys.shadow(tradeId),
    queryFn: () => tradeApi.getShadow(tradeId),
    enabled: Boolean(tradeId),
  });

  return {
    trade: detailsQuery.data,
    timeline: timelineQuery.data || [],
    events: eventsQuery.data || [],
    shadow: shadowQuery.data,
    isLoading: detailsQuery.isLoading,
    error: detailsQuery.error,
    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.details(tradeId) });
      queryClient.invalidateQueries({ queryKey: tradeKeys.timeline(tradeId) });
      queryClient.invalidateQueries({ queryKey: tradeKeys.events(tradeId) });
    },
  };
}

export default useTrades;