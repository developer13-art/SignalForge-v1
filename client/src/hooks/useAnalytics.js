/**
 * useAnalytics Hook
 *
 * Wraps the analytics API endpoints into React Query hooks. Each
 * helper maps to a specific server-side aggregation so that the
 * frontend never recomputes metrics locally.
 *
 * @module client/src/hooks/useAnalytics
 */

import { useQuery } from '@tanstack/react-query';

import { analyticsApi } from '../api/analytics.api.js';

const QUERY_KEY = ['analytics'];

export function useAnalyticsOverview({ from, to, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overview', { from, to }],
    queryFn: () => analyticsApi.getOverview({ from, to }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEquityCurve({ from, to, granularity = 'day', accountId, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'equity-curve', { from, to, granularity, accountId }],
    queryFn: () => analyticsApi.getEquityCurve({ from, to, granularity, accountId }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useDrawdownSeries({ from, to, accountId, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'drawdown', { from, to, accountId }],
    queryFn: () => analyticsApi.getDrawdown({ from, to, accountId }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useWinRate({ from, to, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'win-rate', { from, to }],
    queryFn: () => analyticsApi.getWinRate({ from, to }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useProfitFactor({ from, to, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'profit-factor', { from, to }],
    queryFn: () => analyticsApi.getProfitFactor({ from, to }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useSymbolPerformance({ from, to, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'symbol-performance', { from, to }],
    queryFn: () => analyticsApi.getSymbolPerformance({ from, to }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useTradingCalendar({ month, year, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'calendar', { month, year }],
    queryFn: () => analyticsApi.getTradingCalendar({ month, year }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useExecutionLatency({ from, to, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'latency', { from, to }],
    queryFn: () => analyticsApi.getExecutionLatency({ from, to }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useRiskBehavior({ from, to, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'risk-behavior', { from, to }],
    queryFn: () => analyticsApi.getRiskBehavior({ from, to }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerformanceReports({ page = 1, limit = 20, enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'reports', { page, limit }],
    queryFn: () => analyticsApi.listReports({ page, limit }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}