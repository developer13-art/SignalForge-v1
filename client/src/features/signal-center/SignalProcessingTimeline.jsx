import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, RefreshCw, Activity } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SignalTimeline from '../../components/domain/signal/SignalTimeline';
import ErrorState from '../../components/common/ErrorState';

const SignalProcessingTimeline = function SignalProcessingTimeline() {
  const { signalId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/signals/${signalId}/timeline`, {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load timeline');
        return;
      }

      setEvents(payload.data || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [signalId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Processing Timeline
            </Heading>
            <Text color="muted" className="text-xs">
              Every stage from receipt to execution
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTimeline}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <Loader2 size={32} className="animate-spin" aria-hidden="true" />
            <p className="mt-3 text-sm">Loading timeline...</p>
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load timeline"
            description={error}
            onRetry={fetchTimeline}
          />
        ) : (
          <SignalTimeline events={events} orientation="vertical" />
        )}
      </Card>
    </Container>
  );
};

export default SignalProcessingTimeline;