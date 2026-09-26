import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';
import SparklineChart from '../../components/charts/SparklineChart';

const SubscriptionRevenue = function SubscriptionRevenue() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/revenue/subscriptions', {
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
            <DollarSign size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Subscription Revenue
            </Heading>
            <Text color="muted" className="text-xs">
              Recurring revenue from user and provider subscriptions
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={data?.total !== undefined ? `$${data.total}` : '—'}
            icon={DollarSign}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="MRR"
            value={data?.mrr !== undefined ? `$${data.mrr}` : '—'}
            icon={DollarSign}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="ARR"
            value={data?.arr !== undefined ? `$${data.arr}` : '—'}
            icon={DollarSign}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Active Subscriptions"
            value={data?.activeSubscriptions || 0}
            icon={DollarSign}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.trend && data.trend.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Revenue Trend
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
              Monthly Revenue
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'revenue', name: 'Revenue', color: '#10b981' }]}
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

export default SubscriptionRevenue;