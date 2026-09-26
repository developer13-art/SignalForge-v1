import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';
import BarChart from '../../components/charts/BarChart';

const WhiteLabelAnalytics = function WhiteLabelAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/analytics', {
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

  const handleBack = useCallback(() => navigate('/white-label'), [navigate]);

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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              White-Label Analytics
            </Heading>
            <Text color="muted" className="text-xs">
              Performance metrics for your branded platform
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Users"
            value={data?.totalUsers || 0}
            icon={BarChart3}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Trades"
            value={data?.totalTrades || 0}
            icon={BarChart3}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Signal Volume"
            value={data?.signalVolume || 0}
            icon={BarChart3}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Monthly Revenue"
            value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
            icon={BarChart3}
            variant="success"
            loading={loading}
          />
        </div>

        {data?.growthTrend && data.growthTrend.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              User Growth
            </Heading>
            <div className="mt-4">
              <EquityCurveChart
                data={data.growthTrend}
                xKey="date"
                dataKey="users"
                height={280}
                color="#4f46e5"
                valueFormatter={(value) => `${value}`}
              />
            </div>
          </Card>
        ) : null}

        {data?.monthlyActivity && data.monthlyActivity.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Monthly Activity
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthlyActivity}
                bars={[{ dataKey: 'trades', name: 'Trades', color: '#0ea5e9' }]}
                xKey="month"
                height={280}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default WhiteLabelAnalytics;