import React, { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import SparklineChart from '../../components/charts/SparklineChart';

const SortinoRatio = function SortinoRatio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/sortino', { credentials: 'include' });
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
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Sortino Ratio
            </Heading>
            <Text color="muted" className="text-xs">
              Risk-adjusted return using downside deviation
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
          label="Sortino Ratio"
          value={data?.sortinoRatio !== undefined ? data.sortinoRatio : '—'}
          icon={Activity}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Downside Deviation"
          value={data?.downsideDeviation !== undefined ? data.downsideDeviation : '—'}
          icon={Activity}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Upside Return"
          value={data?.upsideReturn !== undefined ? `${data.upsideReturn}%` : '—'}
          icon={Activity}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Downside Return"
          value={data?.downsideReturn !== undefined ? `${data.downsideReturn}%` : '—'}
          icon={Activity}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Ratio Over Time
        </Heading>
        {data?.history && data.history.length > 0 ? (
          <div className="mt-4">
            <SparklineChart
              data={data.history}
              dataKey="value"
              width={520}
              height={72}
              variant="area"
              color="#8b5cf6"
              showLastDot
              className="w-full"
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No history data available.</p>
        )}

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            Unlike the Sharpe ratio, Sortino only penalizes downside volatility. Higher is better.
            A ratio above 1.0 is generally considered acceptable.
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default SortinoRatio;