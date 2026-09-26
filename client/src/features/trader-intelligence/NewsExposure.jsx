import React, { useCallback, useEffect, useState } from 'react';
import { Wind, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';

const NewsExposure = function NewsExposure() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/news-exposure', {
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

  const columns = [
    {
      key: 'event',
      header: 'News Event',
      accessor: 'event',
      render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
    },
    {
      key: 'impact',
      header: 'Impact',
      accessor: 'impact',
      render: (value) => (
        <span
          className={[
            'rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            value === 'high'
              ? 'bg-rose-50 text-rose-700'
              : value === 'medium'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-sky-50 text-sky-700',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'positionsOpened',
      header: 'Positions Opened',
      accessor: 'positionsOpened',
      align: 'right',
    },
    {
      key: 'avgProfit',
      header: 'Avg Profit',
      accessor: 'avgProfit',
      align: 'right',
      render: (value) => (
        <span
          className={[
            'text-sm font-semibold',
            Number(value) >= 0 ? 'text-emerald-600' : 'text-rose-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          ${value || 0}
        </span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Wind size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              News Exposure
            </Heading>
            <Text color="muted" className="text-xs">
              How you trade around high-impact news events
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
          label="News Trades"
          value={data?.newsTrades || 0}
          icon={Wind}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="News Win Rate"
          value={data?.newsWinRate !== undefined ? `${data.newsWinRate}%` : '—'}
          icon={Wind}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Avg News Profit"
          value={data?.avgNewsProfit !== undefined ? `$${data.avgNewsProfit}` : '—'}
          icon={Wind}
          variant={Number(data?.avgNewsProfit) >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
        <StatCard
          label="Exposure Level"
          value={data?.exposureLevel || '—'}
          icon={Wind}
          variant={data?.exposureLevel === 'high' ? 'warning' : 'success'}
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          News Events You Traded
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={data?.events || []}
            rowKey="id"
            loading={loading}
            emptyState={
              <p className="text-sm text-slate-400">No news events recorded.</p>
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default NewsExposure;