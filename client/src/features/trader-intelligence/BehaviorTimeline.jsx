import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import TraderBehaviorTimeline from '../../components/domain/trader/TraderBehaviorTimeline';

const BehaviorTimeline = function BehaviorTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/timeline', {
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
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Behavior Timeline
            </Heading>
            <Text color="muted" className="text-xs">
              Chronological behavioral events detected in your trading history
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
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No behavioral events"
            description="Events will appear as the AI detects patterns in your trading."
          />
        ) : (
          <TraderBehaviorTimeline events={events} title="Behavior Timeline" />
        )}
      </Card>
    </Container>
  );
};

export default BehaviorTimeline;