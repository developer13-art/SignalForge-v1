import React, { useCallback, useEffect, useState } from 'react';
import { Flag, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const RiskFlags = function RiskFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/risk-flags', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setFlags(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const columns = [
    {
      key: 'user',
      header: 'User',
      accessor: 'userEmail',
      render: (value) => (
        <span className="text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'flag',
      header: 'Flag',
      accessor: 'label',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      accessor: 'severity',
      render: (value) => (
        <span
          className={[
            'rounded px-2 py-0.5 text-[10px] font-semibold uppercase',
            value === 'high'
              ? 'bg-rose-50 text-rose-700'
              : value === 'medium'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-sky-50 text-sky-700',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'flaggedAt',
      header: 'Flagged',
      accessor: 'flaggedAt',
      align: 'right',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Flag size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Flags
            </Heading>
            <Text color="muted" className="text-xs">
              Users flagged by automated or manual compliance review
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchFlags}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={flags}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Flag}
              title="No risk flags"
              description="Users flagged for compliance review will appear here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default RiskFlags;