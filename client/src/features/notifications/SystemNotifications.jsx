import React, { useCallback, useEffect, useState } from 'react';
import { Bell, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import NotificationList from '../../components/domain/notification/NotificationList';

const SystemNotifications = function SystemNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?category=system', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setNotifications(payload.data?.items || []);
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

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Bell size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              System Notifications
            </Heading>
            <Text color="muted" className="text-xs">
              Platform updates, maintenance, and important announcements
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
          Refresh
        </Button>
      </div>

      <div className="mt-6">
        <NotificationList
          notifications={notifications}
          loading={loading}
          showFilters={false}
          maxHeight="70vh"
        />
      </div>
    </Container>
  );
};

export default SystemNotifications;