import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';

const ProviderAnalytics = function ProviderAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/analytics', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Analytics
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed analytics for your provider signals and subscribers
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Signals Sent"
            value={data?.signalsSent || 0}
            icon={TrendingUp}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Win Rate"
            value={data?.winRate !== undefined ? `${data.winRate}%` : '—'}
            icon={TrendingUp}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Avg R:R"
            value={data?.avgRR !== undefined ? data.avgRR : '—'}
            icon={TrendingUp}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Subscriber Growth"
            value={data?.subscriberGrowth !== undefined ? `${data.subscriberGrowth}%` : '—'}
            icon={TrendingUp}
            variant="success"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Performance Trend
          </Heading>
          {data?.performanceHistory && data.performanceHistory.length > 0 ? (
            <div className="mt-4">
              <EquityCurveChart
                data={data.performanceHistory}
                xKey="date"
                dataKey="value"
                height={280}
                color="#4f46e5"
                valueFormatter={(value) => `${value}`}
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

export default ProviderAnalytics;