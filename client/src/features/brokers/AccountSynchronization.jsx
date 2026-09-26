import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Timeline from '../../components/data-display/Timeline';

const AccountSynchronization = function AccountSynchronization() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brokers/accounts/${accountId}/sync-events`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setEvents(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 20000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleSyncNow = useCallback(async () => {
    try {
      await fetch(`/api/brokers/accounts/${accountId}/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      fetchEvents();
    } catch (_err) {
      // silent
    }
  }, [accountId, fetchEvents]);

  const timelineItems = events.map((event) => ({
    key: event.id,
    title: event.title,
    description: event.description,
    time: event.time,
    icon:
      event.status === 'success'
        ? CheckCircle2
        : event.status === 'pending'
        ? Clock
        : AlertCircle,
    variant:
      event.status === 'success' ? 'success' : event.status === 'pending' ? 'info' : 'danger',
  }));

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleSyncNow} leadingIcon={RefreshCw}>
            Sync Now
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <Heading level={1} size="text-2xl">
          Account Synchronization
        </Heading>
        <Text color="muted" className="mt-1 text-xs">
          Every event related to synchronizing this account with MetaApi
        </Text>

        <Separator spacing="md" />

        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-400">No synchronization events yet.</p>
        ) : (
          <Timeline items={timelineItems} />
        )}
      </Card>
    </Container>
  );
};

export default AccountSynchronization;