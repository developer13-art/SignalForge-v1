import React, { useCallback, useEffect, useState } from 'react';
import { Percent, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const RiskRewardAnalysis = function RiskRewardAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/risk-reward', { credentials: 'include' });
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
            <Percent size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk/Reward Analysis
            </Heading>
            <Text color="muted" className="text-xs">
              Average risk-to-reward ratio and distribution
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
          label="Avg R:R"
          value={data?.avgRR !== undefined ? data.avgRR : '—'}
          icon={Percent}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Best R:R"
          value={data?.bestRR !== undefined ? data.bestRR : '—'}
          icon={Percent}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Worst R:R"
          value={data?.worstRR !== undefined ? data.worstRR : '—'}
          icon={Percent}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Avg Risk %"
          value={data?.avgRiskPercent !== undefined ? `${data.avgRiskPercent}%` : '—'}
          icon={Percent}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          R:R Distribution
        </Heading>
        {data?.distribution && data.distribution.length > 0 ? (
          <div className="mt-4">
            <BarChart
              data={data.distribution}
              bars={[{ dataKey: 'count', name: 'Trades', color: '#4f46e5' }]}
              xKey="range"
              height={300}
              yAxisFormatter={(value) => `${value}`}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No distribution data available.</p>
        )}
      </Card>
    </Container>
  );
};

export default RiskRewardAnalysis;