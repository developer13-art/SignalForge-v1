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

const NetPlatformRevenue = function NetPlatformRevenue() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/net-revenue', {
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

  const handleBack = useCallback(() => navigate('/executive'), [navigate]);

  return (
    <Container size="xl" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Net Platform Revenue
            </Heading>
            <Text color="muted" className="text-xs">
              Gross revenue minus payouts, commissions, and referral costs
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Net Revenue"
            value={data?.netRevenue !== undefined ? `$${data.netRevenue}` : '—'}
            icon={Wallet}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Gross Revenue"
            value={data?.grossRevenue !== undefined ? `$${data.grossRevenue}` : '—'}
            icon={Wallet}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Total Costs"
            value={data?.totalCosts !== undefined ? `$${data.totalCosts}` : '—'}
            icon={Wallet}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="Margin"
            value={data?.margin !== undefined ? `${data.margin}%` : '—'}
            icon={Wallet}
            variant="info"
            loading={loading}
          />
        </div>

        {data?.trend && data.trend.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Net Revenue Trend
            </Heading>
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
          </Card>
        ) : null}

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Monthly Net Revenue
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'net', name: 'Net Revenue', color: '#10b981' }]}
                xKey="month"
                height={300}
                tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default NetPlatformRevenue;