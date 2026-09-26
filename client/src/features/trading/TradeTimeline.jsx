import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import TradeTimelineComp from '../../components/domain/trade/TradeTimeline';
import EmptyState from '../../components/common/EmptyState';

const TradeTimeline = function TradeTimeline() {
  const navigate = useNavigate();
  const { tradeId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trading/trades/${tradeId}/timeline`, {
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
  }, [tradeId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

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
          onClick={fetchTimeline}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trade Timeline
            </Heading>
            <Text color="muted" className="text-xs">
              Full lifecycle of the trade with actor attribution
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No timeline events"
              description="Events will appear here as the trade progresses."
            />
          ) : (
            <TradeTimelineComp events={events} orientation="vertical" />
          )}
        </div>
      </Card>
    </Container>
  );
};

export default TradeTimeline;