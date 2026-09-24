/**
 * useNotifications Hook
 *
 * Provides the notification list, unread count, mark-as-read helpers,
 * and preference management. Also exposes a subscription helper used
 * by the NotificationContext to wire realtime updates.
 *
 * @module client/src/hooks/useNotifications
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { notificationApi } from '../api/notification.api.js';

const QUERY_KEY = ['notifications'];

export function useNotificationList({ page = 1, limit = 20, unreadOnly = false } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', { page, limit, unreadOnly }],
    queryFn: () => notificationApi.list({ page, limit, unreadOnly }),
    staleTime: 30 * 1000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'preferences'],
    queryFn: () => notificationApi.getPreferences(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => notificationApi.updatePreferences(payload),
    onSuccess: () => {
      toast.success('Notification preferences updated');
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'preferences'] });
    },
    onError: () => {
      toast.error('Failed to update notification preferences');
    },
  });
}

export function useSubscribeToRealtimeNotifications({ onNotification } = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (event) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list'] });

      if (event && event.payload && typeof onNotification === 'function') {
        onNotification(event.payload);
      }
    };

    window.addEventListener('signalforge:notification', handler);

    return () => {
      window.removeEventListener('signalforge:notification', handler);
    };
  }, [queryClient, onNotification]);
}