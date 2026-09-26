import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TradeDetailsComp from '../../components/domain/trade/TradeDetails';
import ErrorState from '../../components/common/ErrorState';

const TradeDetails = function TradeDetails() {
  const { tradeId } = useParams();
  const navigate = useNavigate();

  const [trade, setTrade] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrade = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trading/trades/${tradeId}`, { credentials: 'include' });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load trade');
        return;
      }
      setTrade(payload.data?.trade);
      setTimeline(payload.data?.timeline || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

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
          onClick={fetchTrade}
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
              <Loader2 size={32} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Failed to load trade" description={error} onRetry={fetchTrade} />
          </Card>
        ) : (
          <TradeDetailsComp trade={trade} timeline={timeline} />
        )}
      </div>
    </Container>
  );
};

export default TradeDetails;