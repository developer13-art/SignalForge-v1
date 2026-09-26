import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  RefreshCw,
  Loader2,
  ArrowRight,
  Layers,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import PnLIndicator from '../../components/domain/trade/PnLIndicator';

const TradingOverview = function TradingOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/overview', { credentials: 'include' });
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const quickLinks = [
    { title: 'Open Positions', icon: Layers, href: '/trading/open-positions' },
    { title: 'Pending Orders', icon: Clock, href: '/trading/pending-orders' },
    { title: 'Trade History', icon: TrendingUp, href: '/trading/history' },
    { title: 'Execution History', icon: Zap, href: '/trading/executions' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trading
            </Heading>
            <Text color="muted" className="text-xs">
              Real-time overview of your open positions, orders, and trades
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
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Open Positions"
          value={data?.openPositions || 0}
          icon={Layers}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Floating P/L"
          value={data?.floatingProfit !== undefined ? `$${data.floatingProfit}` : '—'}
          icon={TrendingUp}
          variant={Number(data?.floatingProfit) >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
        <StatCard
          label="Closed Today"
          value={data?.closedToday || 0}
          icon={TrendingUp}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Signals Executed"
          value={data?.signalsExecuted || 0}
          icon={Zap}
          variant="default"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card
              key={link.title}
              padding="lg"
              hoverable
              clickable
              onClick={() => navigate(link.href)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{link.title}</span>
                </div>
                <ArrowRight size={16} className="text-slate-300" aria-hidden="true" />
              </div>
            </Card>
          );
        })}
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <Heading level={3} size="text-base">
            Recent Activity
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trading/history')}
            trailingIcon={ArrowRight}
          >
            View all
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={24} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (data?.recentTrades || []).length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No recent trades yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.recentTrades.map((trade) => (
              <li
                key={trade.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{trade.symbol}</span>
                    <span
                      className={[
                        'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                        trade.direction === 'BUY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {trade.direction}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {trade.volume} lots · {trade.closedAt || 'Open'}
                  </p>
                </div>
                <PnLIndicator value={trade.profit} size="sm" align="right" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default TradingOverview;