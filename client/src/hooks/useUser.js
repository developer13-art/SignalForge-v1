/**
 * useUser Hook
 *
 * Access and mutate the current user's profile and preferences.
 * Wraps React Query so cache invalidation is handled automatically
 * after profile updates.
 *
 * @module client/src/hooks/useUser
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api.js';
import { useAuth } from './useAuth.js';

export const userKeys = {
  all: ['user'],
  profile: () => [...userKeys.all, 'profile'],
  preferences: () => [...userKeys.all, 'preferences'],
  sessions: () => [...userKeys.all, 'sessions'],
  devices: () => [...userKeys.all, 'devices'],
};

export function useUser() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userApi.getProfile(),
    enabled: isAuthenticated,
    initialData: user || undefined,
  });

  const preferencesQuery = useQuery({
    queryKey: userKeys.preferences(),
    queryFn: () => userApi.getPreferences(),
    enabled: isAuthenticated,
  });

  const sessionsQuery = useQuery({
    queryKey: userKeys.sessions(),
    queryFn: () => userApi.listSessions(),
    enabled: isAuthenticated,
  });

  const devicesQuery = useQuery({
    queryKey: userKeys.devices(),
    queryFn: () => userApi.listDevices(),
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload) => userApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload) => userApi.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.preferences() });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId) => userApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions() });
    },
  });

  return {
    profile: profileQuery.data,
    preferences: preferencesQuery.data,
    sessions: sessionsQuery.data || [],
    devices: devicesQuery.data || [],
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    revokeSession: revokeSessionMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending || updatePreferencesMutation.isPending,
  };
}

export default useUser;