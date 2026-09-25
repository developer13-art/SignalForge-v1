import React, { useCallback, useEffect, useState } from 'react';
import { History, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const AiLearningHistory = function AiLearningHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/learning-history', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setHistory(payload.data || []);
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

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      accessor: 'timestamp',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'provider',
      header: 'Provider',
      accessor: 'providerName',
      render: (value) => <span className="text-sm text-slate-700">{value || '—'}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (value) => (
        <Badge variant="info" size="xs">
          {value}
        </Badge>
      ),
    },
    {
      key: 'change',
      header: 'Change',
      accessor: 'change',
      render: (value) => (
        <span className="text-xs font-medium text-slate-700">{value}</span>
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
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Learning History
            </Heading>
            <Text color="muted" className="text-xs">
              Chronological record of every learning improvement
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchHistory}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={history}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={History}
              title="No learning history"
              description="AI learning events will appear here as rules are learned and refined."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default AiLearningHistory;