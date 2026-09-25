import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Brain, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const AiProcessingLogs = function AiProcessingLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/logs', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setLogs(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Time',
        accessor: 'timestamp',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'type',
        header: 'Type',
        accessor: 'type',
        render: (value) => (
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
            {value}
          </span>
        ),
      },
      {
        key: 'provider',
        header: 'Provider',
        accessor: 'providerName',
        render: (value) => (
          <span className="truncate text-xs text-slate-700">{value || '—'}</span>
        ),
      },
      {
        key: 'confidence',
        header: 'Confidence',
        accessor: 'confidence',
        align: 'right',
        render: (value) =>
          value !== undefined ? (
            <span className="text-xs font-semibold text-slate-900">
              {Math.round(value * 100)}%
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: 'duration',
        header: 'Duration',
        accessor: 'duration',
        align: 'right',
        render: (value) => <span className="font-mono text-xs text-slate-600">{value}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => {
          const isSuccess = value === 'success';
          return (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isSuccess ? (
                <CheckCircle2 size={10} aria-hidden="true" />
              ) : (
                <AlertCircle size={10} aria-hidden="true" />
              )}
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
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Processing Logs
            </Heading>
            <Text color="muted" className="text-xs">
              Every AI request, parse, and inference event
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={logs}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Brain}
              title="No AI logs yet"
              description="AI processing logs will appear here as messages are processed."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default AiProcessingLogs;