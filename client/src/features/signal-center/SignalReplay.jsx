import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SignalReplayComp from '../../components/domain/signal/SignalReplay';
import ErrorState from '../../components/common/ErrorState';

const SignalReplay = function SignalReplay() {
  const { signalId } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReplay = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/signals/${signalId}/replay`, {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load replay');
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
    fetchReplay();
  }, [fetchReplay]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

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
          leadingIcon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex flex-col items-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin" aria-hidden="true" />
              <p className="mt-3 text-sm">Loading replay...</p>
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState
              title="Failed to load replay"
              description={error}
              onRetry={fetchReplay}
            />
          </Card>
        ) : (
          <SignalReplayComp events={events} showControls autoPlay={false} />
        )}
      </div>
    </Container>
  );
};

export default SignalReplay;