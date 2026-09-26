import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';
import BarChart from '../../components/charts/BarChart';

const SystemAnalytics = function SystemAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/system-analytics', {
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

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              System Analytics
            </Heading>
            <Text color="muted" className="text-xs">
              Platform-wide usage and performance analytics
            </Text>
          </div>
        </div>
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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="DAU"
          value={data?.dau || 0}
          icon={BarChart3}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="MAU"
          value={data?.mau || 0}
          icon={BarChart3}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Signals Today"
          value={data?.signalsToday || 0}
          icon={BarChart3}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Trades Today"
          value={data?.tradesToday || 0}
          icon={BarChart3}
          variant="default"
          loading={loading}
        />
      </div>

      {data?.userGrowth && data.userGrowth.length > 0 ? (
        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            User Growth
          </Heading>
          <div className="mt-4">
            <EquityCurveChart
              data={data.userGrowth}
              xKey="date"
              dataKey="users"
              height={300}
              color="#4f46e5"
              valueFormatter={(value) => `${value}`}
            />
          </div>
        </Card>
      ) : null}

      {data?.dailyActivity && data.dailyActivity.length > 0 ? (
        <Card padding="lg" className="mt-4">
          <Heading level={3} size="text-base">
            Daily Activity
          </Heading>
          <div className="mt-4">
            <BarChart
              data={data.dailyActivity}
              bars={[{ dataKey: 'value', name: 'Activity', color: '#0ea5e9' }]}
              xKey="date"
              height={300}
            />
          </div>
        </Card>
      ) : null}
    </Container>
  );
};

export default SystemAnalytics;