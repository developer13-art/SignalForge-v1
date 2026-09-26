import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Zap, Loader2, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const ExecutionHistory = function ExecutionHistory() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/executions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setExecutions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const columns = useMemo(
    () => [
      {
        key: 'time',
        header: 'Time',
        accessor: 'time',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'symbol',
        header: 'Symbol',
        accessor: 'symbol',
        render: (value, row) => (
          <span className="font-semibold text-slate-900">
            {value} · {row.direction}
          </span>
        ),
      },
      {
        key: 'volume',
        header: 'Volume',
        accessor: 'volume',
        align: 'right',
      },
      {
        key: 'requestedPrice',
        header: 'Requested',
        accessor: 'requestedPrice',
        align: 'right',
      },
      {
        key: 'executedPrice',
        header: 'Executed',
        accessor: 'executedPrice',
        align: 'right',
      },
      {
        key: 'latency',
        header: 'Latency',
        accessor: 'latency',
        align: 'right',
        render: (value) => (
          <span className="font-mono text-xs text-slate-600">{value}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => {
          const statusConfig = {
            success: {
              icon: CheckCircle2,
              color: 'text-emerald-600 bg-emerald-50',
            },
            failed: {
              icon: XCircle,
              color: 'text-rose-600 bg-rose-50',
            },
            pending: {
              icon: Clock,
              color: 'text-amber-600 bg-amber-50',
            },
          };
          const config = statusConfig[value] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                config.color,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon size={10} aria-hidden="true" />
              {value}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Zap size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Execution History
            </Heading>
            <Text color="muted" className="text-xs">
              Every order sent to your broker with latency and result
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchExecutions}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={executions}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Zap}
              title="No executions yet"
              description="Your execution history will appear here after automated trades."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default ExecutionHistory;