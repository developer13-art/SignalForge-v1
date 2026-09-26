import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TraderBehaviorTimeline from '../../components/domain/trader/TraderBehaviorTimeline';
import EmptyState from '../../components/common/EmptyState';

const TraderBehavior = function TraderBehavior() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBehavior = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/behavior`, {
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
  }, [traderId]);

  useEffect(() => {
    fetchBehavior();
  }, [fetchBehavior]);

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
          onClick={fetchBehavior}
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
        ) : events.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Activity}
              title="No behavior events"
              description="Behavioral events will appear as the trader continues to trade."
            />
          </Card>
        ) : (
          <TraderBehaviorTimeline events={events} />
        )}
      </div>
    </Container>
  );
};

export default TraderBehavior;