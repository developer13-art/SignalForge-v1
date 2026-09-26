import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import TradeHistoryTable from '../../components/domain/trade/TradeHistoryTable';

const TradeHistory = function TradeHistory() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 25,
  });

  const fetchHistory = useCallback(async (page = 1, pageSize = 25) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/trading/history?page=${page}&pageSize=${pageSize}`,
        { credentials: 'include' },
      );
      const payload = await response.json();
      if (response.ok) {
        setTrades(payload.data?.items || []);
        setPagination({
          currentPage: payload.data?.currentPage || 1,
          totalPages: payload.data?.totalPages || 1,
          totalItems: payload.data?.totalItems || 0,
          pageSize: payload.data?.pageSize || pageSize,
        });
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trade History
            </Heading>
            <Text color="muted" className="text-xs">
              All your closed trades in one place
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchHistory(pagination.currentPage, pagination.pageSize)}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <TradeHistoryTable
          trades={trades}
          loading={loading}
          onRowClick={(row) => navigate(`/trading/trades/${row.id}`)}
          showProvider
          showDates
        />
      </Card>
    </Container>
  );
};

export default TradeHistory;