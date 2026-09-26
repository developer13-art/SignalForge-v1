import React, { useCallback, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const ProfitAnalysis = function ProfitAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/profit', { credentials: 'include' });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Profit Analysis
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed breakdown of profit and loss across trades
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
          label="Gross Profit"
          value={data?.grossProfit !== undefined ? `$${data.grossProfit}` : '—'}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Gross Loss"
          value={data?.grossLoss !== undefined ? `$${data.grossLoss}` : '—'}
          icon={TrendingDown}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Net Profit"
          value={data?.netProfit !== undefined ? `$${data.netProfit}` : '—'}
          icon={TrendingUp}
          variant={Number(data?.netProfit) >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
        <StatCard
          label="Profit Factor"
          value={data?.profitFactor !== undefined ? data.profitFactor : '—'}
          icon={TrendingUp}
          variant="primary"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Monthly Performance
        </Heading>
        {data?.monthly && data.monthly.length > 0 ? (
          <div className="mt-4">
            <BarChart
              data={data.monthly}
              bars={[{ dataKey: 'profit', name: 'Profit', color: '#4f46e5' }]}
              xKey="month"
              height={300}
              perCellColors
              colors={['#10b981', '#10b981', '#10b981', '#e11d48', '#10b981', '#10b981']}
              tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No monthly data available.</p>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <Heading level={3} size="text-base">
            Average Trade
          </Heading>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Average Win</span>
              <span className="text-sm font-semibold text-emerald-600">
                ${data?.avgWin || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Average Loss</span>
              <span className="text-sm font-semibold text-rose-600">
                ${data?.avgLoss || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Largest Win</span>
              <span className="text-sm font-semibold text-emerald-600">
                ${data?.largestWin || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Largest Loss</span>
              <span className="text-sm font-semibold text-rose-600">
                ${data?.largestLoss || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <Heading level={3} size="text-base">
            Distribution
          </Heading>
          <div className="mt-4 space-y-3">
            {data?.distribution?.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            )) || (
              <p className="text-sm text-slate-400">No distribution data available.</p>
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ProfitAnalysis;