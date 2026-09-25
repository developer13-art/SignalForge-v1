import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import SignalStatusBadge from '../../components/domain/signal/SignalStatusBadge';
import EmptyState from '../../components/common/EmptyState';

const RejectedSignals = function RejectedSignals() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/signals/rejected', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSignals(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRejected();
  }, [fetchRejected]);

  const columns = useMemo(
    () => [
      {
        key: 'symbol',
        header: 'Symbol',
        accessor: 'symbol',
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{value}</span>
            <span
              className={[
                'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                row.direction === 'BUY'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {row.direction}
            </span>
          </div>
        ),
      },
      {
        key: 'provider',
        header: 'Provider',
        accessor: 'providerName',
        render: (value) => (
          <span className="truncate text-sm text-slate-700">{value || '—'}</span>
        ),
      },
      {
        key: 'reason',
        header: 'Rejection Reason',
        accessor: 'rejectionReason',
        render: (value) => (
          <span className="text-xs font-medium text-rose-700">{value || 'Unknown'}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        render: (value) => <SignalStatusBadge status={value} size="xs" />,
      },
      {
        key: 'time',
        header: 'Time',
        accessor: 'createdAt',
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <XCircle size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Rejected Signals
            </Heading>
            <Text color="muted" className="text-xs">
              Signals that failed validation or risk checks
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRejected}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={signals}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          onRowClick={(row) => navigate(`/signals/${row.id}`)}
          emptyState={
            <EmptyState
              icon={XCircle}
              title="No rejected signals"
              description="Rejected signals and their reasons will appear here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default RejectedSignals;