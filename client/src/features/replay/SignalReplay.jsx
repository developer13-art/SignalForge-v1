import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Radio, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SignalReplayComp from '../../components/domain/signal/SignalReplay';
import EmptyState from '../../components/common/EmptyState';

const SignalReplay = function SignalReplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signalId = searchParams.get('signalId');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReplay = useCallback(async () => {
    if (!signalId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/replay/signal/${signalId}`, {
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
  }, [signalId]);

  useEffect(() => {
    fetchReplay();
  }, [fetchReplay]);

  const handleBack = useCallback(() => navigate('/replay'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReplay}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Replay
            </Heading>
            <Text color="muted" className="text-xs">
              {signalId ? `Signal #${signalId}` : 'No signal selected'}
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {!signalId ? (
            <EmptyState
              icon={Radio}
              title="No signal selected"
              description="Return to the Replay Center and select a signal to replay."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No replay events"
              description="The signal does not have processing events available."
            />
          ) : (
            <SignalReplayComp events={events} showControls autoPlay={false} />
          )}
        </div>
      </Card>
    </Container>
  );
};

export default SignalReplay;