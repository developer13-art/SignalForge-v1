import React, { useCallback, useEffect, useState } from 'react';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const HoldingTime = function HoldingTime() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/holding-time', {
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

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Holding Time
            </Heading>
            <Text color="muted" className="text-xs">
              How long you typically keep positions open
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
          label="Average"
          value={data?.average || '—'}
          icon={Clock}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Median"
          value={data?.median || '—'}
          icon={Clock}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Shortest"
          value={data?.shortest || '—'}
          icon={Clock}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Longest"
          value={data?.longest || '—'}
          icon={Clock}
          variant="warning"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Distribution by Duration
        </Heading>
        {data?.distribution && data.distribution.length > 0 ? (
          <div className="mt-4">
            <BarChart
              data={data.distribution}
              bars={[{ dataKey: 'count', name: 'Trades', color: '#0ea5e9' }]}
              xKey="range"
              height={280}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No distribution data available.</p>
        )}
      </Card>
    </Container>
  );
};

export default HoldingTime;