import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SignalDetailsComp from '../../components/domain/signal/SignalDetails';
import ErrorState from '../../components/common/ErrorState';

const SignalDetails = function SignalDetails() {
  const { signalId } = useParams();
  const navigate = useNavigate();

  const [signal, setSignal] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/signals/${signalId}`, {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load signal details');
        return;
      }

      setSignal(payload.data?.signal);
      setTimeline(payload.data?.timeline || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [signalId]);

  useEffect(() => {
    fetchSignal();
  }, [fetchSignal]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (loading) {
    return (
      <Container size="lg" className="py-16">
        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium">Loading signal...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-16">
        <Card padding="lg">
          <ErrorState
            title="Failed to load signal"
            description={error}
            onRetry={fetchSignal}
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSignal}
          disabled={loading}
          leadingIcon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        <SignalDetailsComp
          signal={signal}
          timeline={timeline}
          showTimeline
          showAnalysis
        />
      </div>
    </Container>
  );
};

export default SignalDetails;