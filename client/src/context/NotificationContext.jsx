/**
 * Notification Context
 *
 * Keeps the notification tray reactive: listens to the realtime
 * `notification.events` channel, exposes the unread count, and
 * dispatches a window event so that the `useNotifications` hook can
 * invalidate its queries without needing a shared socket instance.
 *
 * @module client/src/context/NotificationContext
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useWebSocket } from '../hooks/useWebSocket.js';
import { notificationApi } from '../api/notification.api.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { subscribe } = useWebSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const result = await notificationApi.getUnreadCount();
      setUnreadCount(result?.unreadCount || 0);
    } catch (err) {
      // ignore — count will refresh on next successful poll
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    const unsubscribe = subscribe('message', (event) => {
      if (!event || event.channel !== 'notification.events') {
        return;
      }

      const payload = event.payload || {};
      setUnreadCount((current) => current + 1);
      setRecent((current) => [payload, ...current].slice(0, 20));

      const title = payload.title || 'Notification';
      const body = payload.body || '';
      toast.success(`${title}${body ? ` — ${body}` : ''}`, { duration: 5000 });

      window.dispatchEvent(new CustomEvent('signalforge:notification', { detail: event }));
    });

    return unsubscribe;
  }, [subscribe]);

  const clearAll = useCallback(async () => {
    await notificationApi.markAllAsRead();
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      recent,
      refreshUnreadCount,
      clearAll,
      setUnreadCount,
    }),
    [unreadCount, recent, refreshUnreadCount, clearAll],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return ctx;
}

export { NotificationContext };
export default NotificationContext;