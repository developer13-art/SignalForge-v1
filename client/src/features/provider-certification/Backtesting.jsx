import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw, Play } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';

const Backtesting = function Backtesting() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/backtesting', {
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

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      await fetch('/api/provider-certification/backtesting/run', {
        method: 'POST',
        credentials: 'include',
      });
      fetchData();
    } catch (_err) {
      // silent
    } finally {
      setRunning(false);
    }
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/provider/certification'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRun}
            disabled={running}
            leadingIcon={running ? Loader2 : Play}
          >
            {running ? 'Running...' : 'Run Backtest'}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Backtesting
            </Heading>
            <Text color="muted" className="text-xs">
              Simulate your historical signals on real market data
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Signals Tested"
            value={data?.signalsTested || 0}
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
            label="Net Return"
            value={data?.netReturn !== undefined ? `${data.netReturn}%` : '—'}
            icon={TrendingUp}
            variant={Number(data?.netReturn) >= 0 ? 'success' : 'danger'}
            loading={loading}
          />
          <StatCard
            label="Max Drawdown"
            value={data?.maxDrawdown !== undefined ? `${data.maxDrawdown}%` : '—'}
            icon={TrendingUp}
            variant="warning"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Backtested Equity Curve
          </Heading>
          {data?.equityCurve && data.equityCurve.length > 0 ? (
            <div className="mt-4">
              <EquityCurveChart
                data={data.equityCurve}
                xKey="date"
                dataKey="equity"
                height={300}
                color="#4f46e5"
                valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Run a backtest to see the equity curve.
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default Backtesting;