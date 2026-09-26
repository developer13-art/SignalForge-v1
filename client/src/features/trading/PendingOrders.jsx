import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Loader2, RefreshCw, X } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TradeDirectionBadge from '../../components/domain/trade/TradeDirectionBadge';

const PendingOrders = function PendingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/pending-orders', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setOrders(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = useCallback(async () => {
    if (!cancelling) {
      return;
    }
    try {
      await fetch(`/api/trading/orders/${cancelling.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      setCancelling(null);
      fetchOrders();
    } catch (_err) {
      // silent
    }
  }, [cancelling, fetchOrders]);

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
        key: 'orderType',
        header: 'Type',
        accessor: 'orderType',
        render: (value) => (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            {value}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'Price',
        accessor: 'price',
        align: 'right',
      },
      {
        key: 'volume',
        header: 'Volume',
        accessor: 'volume',
        align: 'right',
      },
      {
        key: 'expiresAt',
        header: 'Expires',
        accessor: 'expiresAt',
        align: 'right',
        render: (value) => (
          <span className="text-xs text-slate-500">{value || 'GTC'}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (value, row) => (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setCancelling(row);
            }}
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Cancel order"
          >
            <X size={14} aria-hidden="true" />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Pending Orders
            </Heading>
            <Text color="muted" className="text-xs">
              Orders waiting to be triggered by price
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="id"
          loading={loading}
          emptyState={
            <EmptyState
              icon={Clock}
              title="No pending orders"
              description="Pending orders will appear here when placed."
            />
          }
        />
      </Card>

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={handleCancel}
        title="Cancel pending order"
        description={
          cancelling
            ? `Are you sure you want to cancel your pending ${cancelling.orderType} order for ${cancelling.symbol}?`
            : ''
        }
        confirmLabel="Cancel Order"
        variant="warning"
      />
    </Container>
  );
};

export default PendingOrders;