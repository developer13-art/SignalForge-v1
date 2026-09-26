import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Star, Activity, Brain } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TraderProfileComp from '../../components/domain/trader/TraderProfile';
import TraderPerformance from '../../components/domain/trader/TraderPerformance';
import FollowTraderButton from '../../components/domain/trader/FollowTraderButton';
import ErrorState from '../../components/common/ErrorState';

const TraderProfile = function TraderProfile() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [trader, setTrader] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);

  const fetchTrader = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load trader');
        return;
      }
      setTrader(payload.data?.trader);
      setPerformance(payload.data?.performance);
      setFollowing(payload.data?.isFollowing || false);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [traderId]);

  useEffect(() => {
    fetchTrader();
  }, [fetchTrader]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleFollow = useCallback(async () => {
    await fetch(`/api/marketplace/traders/${traderId}/follow`, {
      method: 'POST',
      credentials: 'include',
    });
    setFollowing(true);
  }, [traderId]);

  const handleUnfollow = useCallback(async () => {
    await fetch(`/api/marketplace/traders/${traderId}/follow`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setFollowing(false);
  }, [traderId]);

  if (loading && !trader) {
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
          <ErrorState title="Failed to load trader" description={error} onRetry={fetchTrader} />
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
          onClick={fetchTrader}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/traders/${traderId}/reviews`)}
          leadingIcon={Star}
        >
          Reviews
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/traders/${traderId}/behavior`)}
          leadingIcon={Activity}
        >
          Behavior
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/traders/${traderId}/intelligence`)}
          leadingIcon={Brain}
        >
          Intelligence
        </Button>
        <FollowTraderButton
          following={following}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      </div>

      <div className="mt-4 space-y-4">
        <TraderProfileComp trader={trader} />

        {performance ? <TraderPerformance metrics={performance} /> : null}
      </div>
    </Container>
  );
};

export default TraderProfile;