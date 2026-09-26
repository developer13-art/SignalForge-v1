import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const ReferralPerformance = function ReferralPerformance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/performance', { credentials: 'include' });
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
    <Container size="xl" className="py-6">
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
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Performance
            </Heading>
            <Text color="muted" className="text-xs">
              Trading performance of users in your referral network
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Volume"
            value={data?.totalVolume !== undefined ? `$${data.totalVolume}` : '—'}
            icon={TrendingUp}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Eligible Net Profit"
            value={data?.eligibleNetProfit !== undefined ? `$${data.eligibleNetProfit}` : '—'}
            icon={TrendingUp}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Your Rewards"
            value={data?.totalRewards !== undefined ? `$${data.totalRewards}` : '—'}
            icon={TrendingUp}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Reward Rate"
            value={data?.rewardRate !== undefined ? `${data.rewardRate}%` : '0.1%'}
            icon={TrendingUp}
            variant="default"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Monthly Performance
          </Heading>
          {data?.monthly && data.monthly.length > 0 ? (
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'performance', name: 'Performance', color: '#8b5cf6' }]}
                xKey="month"
                height={300}
                tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No performance data available.</p>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default ReferralPerformance;