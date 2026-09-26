import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Activity } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TradeShadowComparison from '../../components/domain/trade/TradeShadowComparison';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TradeShadow = function TradeShadow() {
  const navigate = useNavigate();
  const { tradeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShadow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trading/trades/${tradeId}/shadow`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load trade shadow');
        return;
      }
      setData(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchShadow();
  }, [fetchShadow]);

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
          onClick={fetchShadow}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Failed to load" description={error} onRetry={fetchShadow} />
          </Card>
        ) : !data ? (
          <Card padding="lg">
            <EmptyState
              icon={Activity}
              title="No shadow data"
              description="Trade shadow is generated when your management diverges from the provider."
            />
          </Card>
        ) : (
          <TradeShadowComparison
            providerTrade={data.providerTrade}
            userTrade={data.userTrade}
            divergence={data.divergence}
            missedProfit={data.missedProfit}
            betterExit={data.betterExit}
            notes={data.notes}
          />
        )}
      </div>
    </Container>
  );
};

export default TradeShadow;