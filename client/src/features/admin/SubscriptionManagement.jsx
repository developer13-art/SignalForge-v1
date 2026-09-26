import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import SubscriptionStatusBadge from '../../components/domain/subscription/SubscriptionStatusBadge';
import EmptyState from '../../components/common/EmptyState';

const SubscriptionManagement = function SubscriptionManagement() {
  const [data, setData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/subscriptions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setSubscriptions(payload.data?.items || []);
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
      key: 'user',
      header: 'User',
      accessor: 'userEmail',
      render: (value) => (
        <span className="truncate text-sm text-slate-700">{value}</span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      accessor: 'planName',
      render: (value) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
          {value}
        </span>
      ),
    },
    {
      key: 'cycle',
      header: 'Cycle',
      accessor: 'cycle',
      render: (value) => (
        <span className="text-xs capitalize text-slate-600">{value}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">${value}</span>
      ),
    },
    {
      key: 'renewsAt',
      header: 'Renews',
      accessor: 'renewsAt',
      align: 'right',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => <SubscriptionStatusBadge status={value} size="xs" />,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Subscription Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage all platform subscriptions
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
          label="Active Subscriptions"
          value={data?.active || 0}
          icon={CreditCard}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Trial"
          value={data?.trial || 0}
          icon={CreditCard}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Past Due"
          value={data?.pastDue || 0}
          icon={CreditCard}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="MRR"
          value={data?.mrr !== undefined ? `$${data.mrr}` : '—'}
          icon={CreditCard}
          variant="primary"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={subscriptions}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={CreditCard}
              title="No subscriptions"
              description="Subscriptions will appear here as users subscribe."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default SubscriptionManagement;