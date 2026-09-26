import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ReferralRewardCard from '../../components/domain/referral/ReferralRewardCard';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/data-display/StatCard';

const PendingRewards = function PendingRewards() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/pending', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/referrals'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Pending Rewards
            </Heading>
            <Text color="muted" className="text-xs">
              Rewards waiting for the next monthly settlement
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <StatCard
            label="Total Pending"
            value={data?.totalPending !== undefined ? `$${data.totalPending}` : '—'}
            icon={Clock}
            variant="warning"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Reward Breakdown
          </Heading>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : (data?.rewards || []).length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No pending rewards"
                description="Pending rewards will appear as your referrals trade."
              />
            ) : (
              data.rewards.map((reward) => (
                <ReferralRewardCard key={reward.id} reward={reward} currency="USD" />
              ))
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default PendingRewards;