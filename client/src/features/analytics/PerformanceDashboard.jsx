import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';
import ProgressBar from '../../components/common/ProgressBar';

const PerformanceDashboard = function PerformanceDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/performance?period=${period}`, {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Performance Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Complete performance overview for your account
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
          label="Net Profit"
          value={data?.netProfit !== undefined ? `$${data.netProfit}` : '—'}
          icon={BarChart3}
          variant={Number(data?.netProfit) >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
        <StatCard
          label="Total Trades"
          value={data?.totalTrades || 0}
          icon={BarChart3}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Win Rate"
          value={data?.winRate !== undefined ? `${data.winRate}%` : '—'}
          icon={BarChart3}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg R:R"
          value={data?.avgRR !== undefined ? data.avgRR : '—'}
          icon={BarChart3}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Equity Curve
        </Heading>
        {data?.equityHistory && data.equityHistory.length > 0 ? (
          <div className="mt-4">
            <EquityCurveChart
              data={data.equityHistory}
              xKey="date"
              dataKey="equity"
              height={300}
              color="#4f46e5"
              valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No equity history available.</p>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <Heading level={3} size="text-base">
            Profit Metrics
          </Heading>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Gross Profit', value: data?.grossProfit, color: 'text-emerald-600' },
              { label: 'Gross Loss', value: data?.grossLoss, color: 'text-rose-600' },
              { label: 'Avg Win', value: data?.avgWin, color: 'text-emerald-600' },
              { label: 'Avg Loss', value: data?.avgLoss, color: 'text-rose-600' },
              { label: 'Profit Factor', value: data?.profitFactor, color: 'text-slate-900' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">{metric.label}</span>
                <span className={['text-sm font-semibold', metric.color].filter(Boolean).join(' ')}>
                  {metric.value !== undefined ? `$${metric.value}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <Heading level={3} size="text-base">
            Risk Metrics
          </Heading>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Max Drawdown</span>
                <span className="font-semibold text-rose-600">
                  {data?.maxDrawdown !== undefined ? `${data.maxDrawdown}%` : '—'}
                </span>
              </div>
              <ProgressBar
                value={data?.maxDrawdown || 0}
                max={100}
                size="sm"
                variant="danger"
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Recovery Rate</span>
                <span className="font-semibold text-emerald-600">
                  {data?.recoveryRate !== undefined ? `${data.recoveryRate}%` : '—'}
                </span>
              </div>
              <ProgressBar
                value={data?.recoveryRate || 0}
                max={100}
                size="sm"
                variant="success"
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Sharpe Ratio</span>
              <span className="text-sm font-semibold text-slate-900">
                {data?.sharpeRatio !== undefined ? data.sharpeRatio : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Sortino Ratio</span>
              <span className="text-sm font-semibold text-slate-900">
                {data?.sortinoRatio !== undefined ? data.sortinoRatio : '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default PerformanceDashboard;