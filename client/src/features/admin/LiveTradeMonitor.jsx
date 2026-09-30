import React, { useCallback, useEffect, useState } from 'react';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [tradesResponse, breakdownResponse, todayResponse] = await Promise.all([
        fetch('/api/admin/trades?status=OPEN&limit=100'),
        fetch('/api/admin/trades/status-breakdown'),
        fetch(`/api/admin/trades/status-breakdown?since=${encodeURIComponent(today.toISOString())}`),
      ]);
      const [tradesPayload, breakdownPayload, todayPayload] = await Promise.all([
        tradesResponse.json(),
        breakdownResponse.json(),
        todayResponse.json(),
      ]);
      if (tradesResponse.ok && breakdownResponse.ok && todayResponse.ok) {
        const tradeItems = tradesPayload.data?.items || [];
        const allStatuses = breakdownPayload.data?.breakdown || {};
        const todayStatuses = todayPayload.data?.breakdown || {};
        setTrades(
          tradeItems.map((trade) => ({
            ...trade,
            id: trade.tradeId,
            userName: trade.userEmail,
            currentPrice: trade.exitPrice,
            profit: trade.realizedProfit,
          })),
        );
        setData({
          openTrades: allStatuses.OPEN || 0,
          executedToday: todayStatuses.CLOSED || 0,
          failedToday: todayStatuses.FAILED || 0,
          totalVolume: tradeItems.reduce((total, trade) => total + Number(trade.volume || 0), 0),
        });
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
          value={data?.openTrades ?? '—'}
          icon={Activity}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Executed Today"
          value={data?.executedToday ?? '—'}
          icon={Activity}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Failed Today"
          value={data?.failedToday ?? '—'}
          icon={Activity}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Total Volume"
          value={data?.totalVolume ?? '—'}
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