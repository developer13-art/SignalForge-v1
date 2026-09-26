import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TraderPerformanceComp from '../../components/domain/trader/TraderPerformance';
import ErrorState from '../../components/common/ErrorState';

const TraderPerformance = function TraderPerformance() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/performance`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load performance');
        return;
      }
      setMetrics(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [traderId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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
          onClick={fetchMetrics}
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
            <ErrorState title="Failed to load" description={error} onRetry={fetchMetrics} />
          </Card>
        ) : (
          <TraderPerformanceComp metrics={metrics} period="90d" />
        )}
      </div>
    </Container>
  );
};

export default TraderPerformance;