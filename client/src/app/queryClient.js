/**
 * React Query Client
 *
 * Shared client for server-state management. Retries are disabled by
 * default for mutations and only enabled for read queries so that
 * transient network failures do not silently duplicate writes.
 *
 * @module client/src/app/queryClient
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const status = error && error.response ? error.response.status : null;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;