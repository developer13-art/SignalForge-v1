import React, { useCallback, useEffect, useState } from 'react';
import { Bell, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import NotificationList from '../../components/domain/notification/NotificationList';
import NotificationBadge from '../../components/domain/notification/NotificationBadge';
import StatCard from '../../components/data-display/StatCard';

const NotificationCenter = function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setNotifications(payload.data?.items || []);
        setSummary(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(
    async (notification) => {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'POST',
          credentials: 'include',
        });
        fetchNotifications();
      } catch (_err) {
        // silent
      }
    },
    [fetchNotifications],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
      });
      fetchNotifications();
    } catch (_err) {
      // silent
    }
  }, [fetchNotifications]);

  const handleDelete = useCallback(
    async (notification) => {
      try {
        await fetch(`/api/notifications/${notification.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchNotifications();
      } catch (_err) {
        // silent
      }
    },
    [fetchNotifications],
  );

  return (
    <Container size="lg" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Bell size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Notification Center
            </Heading>
            <Text color="muted" className="text-xs">
              All your notifications in one place
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchNotifications}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={summary?.total || 0}
          icon={Bell}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Unread"
          value={summary?.unread || 0}
          icon={Bell}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Trades"
          value={summary?.trades || 0}
          icon={Bell}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="System"
          value={summary?.system || 0}
          icon={Bell}
          variant="default"
          loading={loading}
        />
      </div>

      <div className="mt-6">
        <NotificationList
          notifications={notifications}
          loading={loading}
          onItemClick={() => {}}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          onMarkAllRead={handleMarkAllRead}
          maxHeight="70vh"
        />
      </div>
    </Container>
  );
};

export default NotificationCenter;