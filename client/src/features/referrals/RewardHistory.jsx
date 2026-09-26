import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ReferralRewardCard from '../../components/domain/referral/ReferralRewardCard';
import EmptyState from '../../components/common/EmptyState';

const RewardHistory = function RewardHistory() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/history', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setRewards(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

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
          onClick={fetchRewards}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Reward History
            </Heading>
            <Text color="muted" className="text-xs">
              Full record of every reward you have earned
            </Text>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <Card padding="lg">
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            </Card>
          ) : rewards.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={TrendingUp}
                title="No reward history"
                description="Your earned rewards will appear here."
              />
            </Card>
          ) : (
            rewards.map((reward) => (
              <ReferralRewardCard key={reward.id} reward={reward} currency="USD" />
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default RewardHistory;