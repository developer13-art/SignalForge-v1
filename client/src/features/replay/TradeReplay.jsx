import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw, Play, Pause } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import TradeTimeline from '../../components/domain/trade/TradeTimeline';
import EmptyState from '../../components/common/EmptyState';

const TradeReplay = function TradeReplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tradeId = searchParams.get('tradeId');

  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReplay = useCallback(async () => {
    if (!tradeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/replay/trade/${tradeId}`, {
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
    fetchReplay();
  }, [fetchReplay]);

  useEffect(() => {
    if (!playing || events.length === 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev >= events.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [playing, currentIndex, events.length]);

  const handleBack = useCallback(() => navigate('/replay'), [navigate]);

  const visibleEvents = events.slice(0, currentIndex + 1);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReplay}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Trade Replay
              </Heading>
              <Text color="muted" className="text-xs">
                {tradeId ? `Trade #${tradeId}` : 'No trade selected'}
              </Text>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPlaying((prev) => !prev)}
                leadingIcon={playing ? Pause : Play}
              >
                {playing ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(0);
                  setPlaying(false);
                }}
              >
                Reset
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          {!tradeId ? (
            <EmptyState
              icon={TrendingUp}
              title="No trade selected"
              description="Return to the Replay Center and select a trade to replay."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No replay events"
              description="The trade does not have lifecycle events available."
            />
          ) : (
            <>
              <div className="mb-4 text-xs text-slate-500">
                Step {currentIndex + 1} of {events.length}
              </div>
              <TradeTimeline events={visibleEvents} orientation="vertical" />
            </>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default TradeReplay;