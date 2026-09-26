import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TradeDetails from '../../components/domain/trade/TradeDetails';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PositionDetails = function PositionDetails() {
  const { positionId } = useParams();
  const navigate = useNavigate();

  const [position, setPosition] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const fetchPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trading/positions/${positionId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load position');
        return;
      }
      setPosition(payload.data?.position);
      setTimeline(payload.data?.timeline || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 15000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleClose = useCallback(async () => {
    try {
      await fetch(`/api/trading/positions/${positionId}/close`, {
        method: 'POST',
        credentials: 'include',
      });
      setConfirmClose(false);
      navigate('/trading/open-positions');
    } catch (_err) {
      // silent
    }
  }, [positionId, navigate]);

  if (loading && !position) {
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
          <ErrorState title="Failed to load position" description={error} onRetry={fetchPosition} />
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

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPosition}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setConfirmClose(true)}>
            Close Position
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <TradeDetails trade={position} timeline={timeline} />
      </div>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={handleClose}
        title="Close position"
        description="This will submit a market close order for the entire position."
        confirmLabel="Close Now"
        variant="warning"
      />
    </Container>
  );
};

export default PositionDetails;