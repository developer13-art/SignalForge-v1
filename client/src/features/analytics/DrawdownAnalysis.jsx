import React, { useCallback, useEffect, useState } from 'react';
import { TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DrawdownChart from '../../components/charts/DrawdownChart';

const DrawdownAnalysis = function DrawdownAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/drawdown', { credentials: 'include' });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <TrendingDown size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Drawdown Analysis
            </Heading>
            <Text color="muted" className="text-xs">
              Peak-to-trough decline and recovery analysis
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
          label="Current Drawdown"
          value={data?.currentDrawdown !== undefined ? `${data.currentDrawdown}%` : '—'}
          icon={TrendingDown}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Max Drawdown"
          value={data?.maxDrawdown !== undefined ? `${data.maxDrawdown}%` : '—'}
          icon={TrendingDown}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Recovery Time"
          value={data?.recoveryDays !== undefined ? `${data.recoveryDays} days` : '—'}
          icon={TrendingDown}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Longest Drawdown"
          value={data?.longestDrawdown !== undefined ? `${data.longestDrawdown} days` : '—'}
          icon={TrendingDown}
          variant="primary"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Drawdown Over Time
        </Heading>
        {data?.history && data.history.length > 0 ? (
          <div className="mt-4">
            <DrawdownChart
              data={data.history}
              xKey="date"
              dataKey="drawdown"
              height={300}
              showThresholdLine
              threshold={-Math.abs(data.maxDrawdown || 20)}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No drawdown history available.</p>
        )}
      </Card>
    </Container>
  );
};

export default DrawdownAnalysis;