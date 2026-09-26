import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import TradeDirectionBadge from '../../components/domain/trade/TradeDirectionBadge';
import PnLIndicator from '../../components/domain/trade/PnLIndicator';

const ClosedTrades = function ClosedTrades() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/closed-trades', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setTrades(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const columns = useMemo(
    () => [
      {
        key: 'symbol',
        header: 'Symbol',
        accessor: 'symbol',
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{value}</span>
            <TradeDirectionBadge direction={row.direction} size="xs" />
          </div>
        ),
      },
      {
        key: 'volume',
        header: 'Volume',
        accessor: 'volume',
        align: 'right',
      },
      {
        key: 'entryPrice',
        header: 'Entry',
        accessor: 'entryPrice',
        align: 'right',
      },
      {
        key: 'exitPrice',
        header: 'Exit',
        accessor: 'exitPrice',
        align: 'right',
      },
      {
        key: 'profit',
        header: 'P/L',
        accessor: 'profit',
        align: 'right',
        render: (value, row) => <PnLIndicator value={value} percent={row.profitPercent} size="sm" align="right" />,
      },
      {
        key: 'closedAt',
        header: 'Closed',
        accessor: 'closedAt',
        align: 'right',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Closed Trades
            </Heading>
            <Text color="muted" className="text-xs">
              All completed trades with full details
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTrades}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={trades}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          onRowClick={(row) => navigate(`/trading/trades/${row.id}`)}
          emptyState={
            <EmptyState
              icon={CheckCircle2}
              title="No closed trades"
              description="Your closed trades will appear here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default ClosedTrades;