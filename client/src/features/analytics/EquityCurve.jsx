import React, { useCallback, useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EquityCurveChart from '../../components/charts/EquityCurveChart';
import StatCard from '../../components/data-display/StatCard';

const EquityCurve = function EquityCurve() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/equity?period=${period}`, {
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
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periods = ['7d', '30d', '90d', '1y', 'all'];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Equity Curve
            </Heading>
            <Text color="muted" className="text-xs">
              Track account equity over time
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              period === p
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {p === 'all' ? 'All Time' : p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Starting Equity"
          value={data?.startEquity !== undefined ? `$${data.startEquity}` : '—'}
          icon={TrendingUp}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Current Equity"
          value={data?.currentEquity !== undefined ? `$${data.currentEquity}` : '—'}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Total Return"
          value={data?.totalReturnPercent !== undefined ? `${data.totalReturnPercent}%` : '—'}
          icon={TrendingUp}
          variant={Number(data?.totalReturn) >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
        <StatCard
          label="Peak Equity"
          value={data?.peakEquity !== undefined ? `$${data.peakEquity}` : '—'}
          icon={TrendingUp}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        {data?.history && data.history.length > 0 ? (
          <EquityCurveChart
            data={data.history}
            xKey="date"
            dataKey="equity"
            height={380}
            color="#4f46e5"
            showBaseline={data.baseline !== undefined}
            baselineKey="baseline"
            valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
          />
        ) : (
          <p className="text-sm text-slate-400">No equity history available.</p>
        )}
      </Card>
    </Container>
  );
};

export default EquityCurve;