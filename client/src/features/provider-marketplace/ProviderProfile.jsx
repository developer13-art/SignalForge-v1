import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Star, Users } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProviderProfileComp from '../../components/domain/provider/ProviderProfile';
import ProviderPerformance from '../../components/domain/provider/ProviderPerformance';
import ProviderDnaCard from '../../components/domain/provider/ProviderDnaCard';
import ErrorState from '../../components/common/ErrorState';

const ProviderProfile = function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProvider = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/marketplace/providers/${providerId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load provider');
        return;
      }
      setProvider(payload.data?.provider);
      setPerformance(payload.data?.performance);
      setDna(payload.data?.dna);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  if (loading && !provider) {
    return (
      <Container size="lg" className="py-16">
        <div className="flex items-center justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin" aria-hidden="true" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-8">
        <Card padding="lg">
          <ErrorState title="Failed to load provider" description={error} onRetry={fetchProvider} />
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
          onClick={fetchProvider}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/providers/${providerId}/reviews`)}
          leadingIcon={Star}
        >
          Reviews
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/providers/${providerId}/subscribers`)}
          leadingIcon={Users}
        >
          Subscribers
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/providers/${providerId}/subscribe`)}
        >
          Subscribe
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        <ProviderProfileComp provider={provider} />

        {performance ? <ProviderPerformance metrics={performance} /> : null}

        {dna ? <ProviderDnaCard dna={dna} /> : null}
      </div>
    </Container>
  );
};

export default ProviderProfile;