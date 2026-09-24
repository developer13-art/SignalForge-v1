/**
 * useFeatureFlag Hook
 *
 * Evaluates client-side feature flags and, optionally, combines them
 * with the server-provided flag set from `/admin/system/flags`. Used
 * by UI components to hide or show gated features without duplicating
 * conditional logic.
 *
 * @module client/src/hooks/useFeatureFlag
 */

import { useQuery } from '@tanstack/react-query';

import { featureFlags } from '../config/feature-flags.config.js';
import { adminApi } from '../api/admin.api.js';

export function useFeatureFlag(flagName) {
  if (!flagName) {
    return false;
  }
  return Boolean(featureFlags[flagName]);
}

export function useFeatureFlags() {
  return featureFlags;
}

export function useServerFeatureFlags({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['feature-flags', 'server'],
    queryFn: () => adminApi.listFlags(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCombinedFeatureFlag(flagName, { serverEnabled = true } = {}) {
  const local = Boolean(featureFlags[flagName]);
  const { data: serverData } = useServerFeatureFlags({ enabled: serverEnabled });

  if (!local) {
    return false;
  }

  if (!serverData || !Array.isArray(serverData.flags)) {
    return local;
  }

  const match = serverData.flags.find((flag) => flag.flagName === flagName);
  return match ? Boolean(match.enabled) : local;
}

export default useFeatureFlag;