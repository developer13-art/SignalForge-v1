import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ReferralRewardCard from '../../components/domain/referral/ReferralRewardCard';

const ReferralEarnings = function ReferralEarnings() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/earnings', { credentials: 'include' });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Earnings
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed view of your earned rewards
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Earned"
            value={data?.totalEarned !== undefined ? `$${data.totalEarned}` : '—'}
            icon={Wallet}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.thisMonth !== undefined ? `$${data.thisMonth}` : '—'}
            icon={Wallet}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Pending"
            value={data?.pending !== undefined ? `$${data.pending}` : '—'}
            icon={Wallet}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="Available"
            value={data?.available !== undefined ? `$${data.available}` : '—'}
            icon={Wallet}
            variant="success"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Recent Rewards
          </Heading>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : (data?.recentRewards || []).length === 0 ? (
              <p className="text-sm text-slate-400">No rewards yet.</p>
            ) : (
              data.recentRewards.map((reward) => (
                <ReferralRewardCard key={reward.id} reward={reward} currency="USD" />
              ))
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ReferralEarnings;