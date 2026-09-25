import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataGrid from '../../components/data-display/DataGrid';
import SignalCard from '../../components/domain/signal/SignalCard';
import EmptyState from '../../components/common/EmptyState';

const ProviderSignals = function ProviderSignals() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [signals, setSignals] = useState([]);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/providers/${providerId}/signals`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSignals(payload.data?.signals || []);
        setProvider(payload.data?.provider || null);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="xl" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              {provider?.name || 'Provider'} Signals
            </Heading>
            <Text color="muted" className="text-xs">
              Signals published by this provider
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6">
        <DataGrid
          items={signals}
          loading={loading}
          columns="md"
          keyExtractor={(item) => item.id}
          renderItem={(signal) => (
            <SignalCard
              signal={signal}
              onClick={() => navigate(`/signals/${signal.id}`)}
            />
          )}
          emptyState={
            <EmptyState
              icon={Users}
              title="No signals from this provider"
              description="Signals will appear here once this provider publishes them."
            />
          }
        />
      </div>
    </Container>
  );
};

export default ProviderSignals;