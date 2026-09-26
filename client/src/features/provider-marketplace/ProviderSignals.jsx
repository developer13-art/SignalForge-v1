import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Radio, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataGrid from '../../components/data-display/DataGrid';
import SignalCard from '../../components/domain/signal/SignalCard';
import EmptyState from '../../components/common/EmptyState';

const ProviderSignals = function ProviderSignals() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/providers/${providerId}/signals`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSignals(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSignals}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        <DataGrid
          items={signals}
          loading={loading}
          columns="md"
          keyExtractor={(item) => item.id}
          renderItem={(signal) => (
            <SignalCard signal={signal} onClick={() => navigate(`/signals/${signal.id}`)} />
          )}
          emptyState={
            <EmptyState
              icon={Radio}
              title="No signals yet"
              description="Signals from this provider will appear here."
            />
          }
        />
      </div>
    </Container>
  );
};

export default ProviderSignals;