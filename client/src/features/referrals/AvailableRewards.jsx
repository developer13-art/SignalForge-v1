import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ReferralRewardCard from '../../components/domain/referral/ReferralRewardCard';
import EmptyState from '../../components/common/EmptyState';

const AvailableRewards = function AvailableRewards() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/available', { credentials: 'include' });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Available Rewards
            </Heading>
            <Text color="muted" className="text-xs">
              Rewards you can withdraw or use for subscriptions
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <StatCard
            label="Total Available"
            value={data?.totalAvailable !== undefined ? `$${data.totalAvailable}` : '—'}
            icon={Wallet}
            variant="success"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <div className="flex items-center justify-between">
            <Heading level={3} size="text-base">
              Available Rewards
            </Heading>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/referrals/wallet')}
              trailingIcon={ArrowRight}
            >
              Withdraw
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : (data?.rewards || []).length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No available rewards"
                description="Rewards become available after each monthly settlement."
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

export default AvailableRewards;