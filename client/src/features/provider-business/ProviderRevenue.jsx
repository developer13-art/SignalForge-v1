import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';
import SparklineChart from '../../components/charts/SparklineChart';

const ProviderRevenue = function ProviderRevenue() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/revenue', {
        credentials: 'include',
      });
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

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Revenue
            </Heading>
            <Text color="muted" className="text-xs">
              Track your subscription revenue and payouts
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={data?.totalRevenue !== undefined ? `$${data.totalRevenue}` : '—'}
            icon={Wallet}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Monthly Revenue"
            value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
            icon={Wallet}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Pending Payout"
            value={data?.pendingPayout !== undefined ? `$${data.pendingPayout}` : '—'}
            icon={Wallet}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="Lifetime Payout"
            value={data?.lifetimePayout !== undefined ? `$${data.lifetimePayout}` : '—'}
            icon={Wallet}
            variant="info"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Revenue Trend
          </Heading>
          {data?.trend && data.trend.length > 0 ? (
            <div className="mt-4">
              <SparklineChart
                data={data.trend}
                dataKey="value"
                width={520}
                height={72}
                variant="area"
                color="#10b981"
                showLastDot
                className="w-full"
              />
            </div>
          ) : null}
        </Card>

        <Card padding="lg" className="mt-4">
          <Heading level={3} size="text-base">
            Monthly Breakdown
          </Heading>
          {data?.monthly && data.monthly.length > 0 ? (
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'revenue', name: 'Revenue', color: '#10b981' }]}
                xKey="month"
                height={300}
                tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No monthly data available.</p>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default ProviderRevenue;