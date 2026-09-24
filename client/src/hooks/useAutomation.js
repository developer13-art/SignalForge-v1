/**
 * useAutomation Hook
 *
 * Provides automation rule CRUD operations and a rule testing helper.
 * Rules are stored under the authenticated user and are cached by
 * React Query.
 *
 * @module client/src/hooks/useAutomation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { automationApi } from '../api/automation.api.js';

const QUERY_KEY = ['automation'];

export function useAutomationRules({ enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'rules'],
    queryFn: () => automationApi.listRules(),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useAutomationRule(ruleId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'rule', ruleId],
    queryFn: () => automationApi.getRule(ruleId),
    enabled: enabled && Boolean(ruleId),
  });
}

export function useCreateAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => automationApi.createRule(payload),
    onSuccess: () => {
      toast.success('Automation rule created');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'rules'] });
    },
    onError: (error) => {
      const message = error?.response?.data?.error?.message || 'Failed to create automation rule';
      toast.error(message);
    },
  });
}

export function useUpdateAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, payload }) => automationApi.updateRule(ruleId, payload),
    onSuccess: (_data, variables) => {
      toast.success('Automation rule updated');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'rules'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'rule', variables.ruleId] });
    },
    onError: () => {
      toast.error('Failed to update automation rule');
    },
  });
}

export function useDeleteAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId) => automationApi.deleteRule(ruleId),
    onSuccess: () => {
      toast.success('Automation rule deleted');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'rules'] });
    },
    onError: () => {
      toast.error('Failed to delete automation rule');
    },
  });
}

export function useToggleAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, enabled }) => automationApi.setRuleEnabled(ruleId, enabled),
    onSuccess: (_data, variables) => {
      toast.success(variables.enabled ? 'Rule enabled' : 'Rule disabled');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'rules'] });
    },
    onError: () => {
      toast.error('Failed to toggle automation rule');
    },
  });
}

export function useTestAutomationRule() {
  return useMutation({
    mutationFn: ({ ruleId, context }) => automationApi.testRule(ruleId, context),
    onError: () => {
      toast.error('Failed to test automation rule');
    },
  });
}