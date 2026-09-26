import React, { useCallback, useEffect, useState } from 'react';
import { Server, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import BrokerConnectionStatus from '../../components/domain/broker/BrokerConnectionStatus';
import EmptyState from '../../components/common/EmptyState';

const BrokerManagement = function BrokerManagement() {
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/brokers', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setAccounts(payload.data?.items || []);
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
      key: 'broker',
      header: 'Broker',
      accessor: 'broker',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">{value}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">
            {row.platform}
          </span>
        </div>
      ),
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
      key: 'login',
      header: 'Login',
      accessor: 'login',
      render: (value) => (
        <span className="font-mono text-xs text-slate-500">{value}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => <BrokerConnectionStatus status={value} size="xs" />,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Server size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Broker Management
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor all broker account connections across the platform
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
          label="Total Accounts"
          value={data?.total || 0}
          icon={Server}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Connected"
          value={data?.connected || 0}
          icon={Server}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Disconnected"
          value={data?.disconnected || 0}
          icon={Server}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Errors"
          value={data?.errors || 0}
          icon={Server}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={accounts}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Server}
              title="No broker accounts"
              description="No broker accounts have been connected yet."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default BrokerManagement;