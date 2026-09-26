import React, { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import TradeMonitorTable from '../../components/domain/admin/TradeMonitorTable';

const LiveTradeMonitor = function LiveTradeMonitor() {
  const [data, setData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/trades/live', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setTrades(payload.data?.items || []);
        setData(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Live Trade Monitor
            </Heading>
            <Text color="muted" className="text-xs">
              Real-time view of trades across the platform
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
          label="Open Trades"
          value={data?.openTrades || 0}
          icon={Activity}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Executed Today"
          value={data?.executedToday || 0}
          icon={Activity}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Failed Today"
          value={data?.failedToday || 0}
          icon={Activity}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Total Volume"
          value={data?.totalVolume || 0}
          icon={Activity}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <TradeMonitorTable
          trades={trades}
          loading={loading}
          showUser
          showProvider
        />
      </Card>
    </Container>
  );
};

export default LiveTradeMonitor;