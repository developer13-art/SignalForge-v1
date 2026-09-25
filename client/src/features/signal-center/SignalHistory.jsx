import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import SignalStatusBadge from '../../components/domain/signal/SignalStatusBadge';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';
import SignalSourceBadge from '../../components/domain/signal/SignalSourceBadge';
import EmptyState from '../../components/common/EmptyState';

const SignalHistory = function SignalHistory() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 25,
  });

  const fetchHistory = useCallback(
    async (page = 1, pageSize = 25) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/signals/history?page=${page}&pageSize=${pageSize}`,
          { credentials: 'include' },
        );
        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Failed to load signal history');
          return;
        }

        setSignals(payload.data?.items || []);
        setPagination({
          currentPage: payload.data?.currentPage || 1,
          totalPages: payload.data?.totalPages || 1,
          totalItems: payload.data?.totalItems || 0,
          pageSize: payload.data?.pageSize || pageSize,
        });
      } catch (_err) {
        setError('Unable to reach the server');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
        key: 'source',
        header: 'Source',
        accessor: 'source',
        render: (value) => <SignalSourceBadge source={value} size="xs" />,
      },
      {
        key: 'confidence',
        header: 'Confidence',
        accessor: 'confidence',
        render: (value) => <SignalConfidenceBadge confidence={value} size="xs" />,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal History
            </Heading>
            <Text color="muted" className="text-xs">
              Full archive of signals processed by your account
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
        <DataTable
          columns={columns}
          rows={signals}
          rowKey="id"
          loading={loading}
          error={error}
          searchable
          sortable
          onRowClick={(row) => navigate(`/signals/${row.id}`)}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            pageSize: pagination.pageSize,
            onPageChange: (page) => fetchHistory(page, pagination.pageSize),
            onPageSizeChange: (size) => fetchHistory(1, size),
            showPageSizeSelector: true,
          }}
          emptyState={
            <EmptyState
              icon={History}
              title="No signals yet"
              description="Signals will appear here as your sources send them."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default SignalHistory;