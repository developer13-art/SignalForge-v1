import React, { useCallback, useEffect, useState } from 'react';
import { Users, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import NotificationList from '../../components/domain/notification/NotificationList';

const ReferralNotifications = function ReferralNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?category=referral', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Notifications
            </Heading>
            <Text color="muted" className="text-xs">
              Rewards, settlements, and referral activity
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

export default ReferralNotifications;