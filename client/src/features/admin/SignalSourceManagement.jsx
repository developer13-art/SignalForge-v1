import React, { useCallback, useEffect, useState } from 'react';
import { Radio, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import SignalSourceBadge from '../../components/domain/signal/SignalSourceBadge';
import EmptyState from '../../components/common/EmptyState';

const SignalSourceManagement = function SignalSourceManagement() {
  const [data, setData] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/signal-sources', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSources(payload.data?.items || []);
        setData(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      key: 'name',
      header: 'Source',
      accessor: 'name',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (value) => <SignalSourceBadge source={value} size="xs" />,
    },
    {
      key: 'user',
      header: 'User',
      accessor: 'userEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-600">{value}</span>
      ),
    },
    {
      key: 'messagesCount',
      header: 'Messages',
      accessor: 'messagesCount',
      align: 'right',
      render: (value) => <span className="text-sm text-slate-800">{value || 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => (
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            value === 'connected'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'error'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-slate-100 text-slate-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Source Management
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor and manage all platform signal sources
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Sources"
          value={data?.total || 0}
          icon={Radio}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Connected"
          value={data?.connected || 0}
          icon={Radio}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Errors"
          value={data?.errors || 0}
          icon={Radio}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Messages Today"
          value={data?.messagesToday || 0}
          icon={Radio}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={sources}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Radio}
              title="No signal sources"
              description="No signal sources have been connected yet."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default SignalSourceManagement;