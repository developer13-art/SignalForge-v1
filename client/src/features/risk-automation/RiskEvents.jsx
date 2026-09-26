import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import RiskEventCard from '../../components/domain/risk/RiskEventCard';

const RiskEvents = function RiskEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/events', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setEvents(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Events
            </Heading>
            <Text color="muted" className="text-xs">
              Every risk decision, block, and warning recorded by the engine
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchEvents}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : events.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Activity}
              title="No risk events"
              description="Risk events will appear here as the engine processes signals."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <RiskEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default RiskEvents;