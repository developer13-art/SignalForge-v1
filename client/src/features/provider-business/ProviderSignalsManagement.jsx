import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, RefreshCw, Send } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import SignalStatusBadge from '../../components/domain/signal/SignalStatusBadge';
import EmptyState from '../../components/common/EmptyState';

const ProviderSignalsManagement = function ProviderSignalsManagement() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/signals', {
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
    fetchSignals();
  }, [fetchSignals]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

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
        key: 'entry',
        header: 'Entry',
        accessor: 'entry',
        align: 'right',
      },
      {
        key: 'confidence',
        header: 'Confidence',
        accessor: 'confidence',
        align: 'right',
        render: (value) => (
          <span className="text-xs font-semibold text-slate-800">
            {value !== undefined ? `${Math.round(value * 100)}%` : '—'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => <SignalStatusBadge status={value} size="xs" />,
      },
      {
        key: 'sentAt',
        header: 'Sent',
        accessor: 'sentAt',
        align: 'right',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSignals}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/provider/signals/new')}
            leadingIcon={Send}
          >
            Send Signal
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signals Management
            </Heading>
            <Text color="muted" className="text-xs">
              All signals published through your provider account
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={signals}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            onRowClick={(row) => navigate(`/provider/signals/${row.id}`)}
            emptyState={
              <EmptyState
                icon={Activity}
                title="No signals yet"
                description="Signals you publish will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default ProviderSignalsManagement;