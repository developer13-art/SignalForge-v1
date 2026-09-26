import React, { useCallback, useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import PaymentStatusBadge from '../../components/domain/payment/PaymentStatusBadge';
import EmptyState from '../../components/common/EmptyState';

const PaymentManagement = function PaymentManagement() {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/payments', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setPayments(payload.data?.items || []);
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
      key: 'reference',
      header: 'Reference',
      accessor: 'reference',
      render: (value) => (
        <span className="font-mono text-xs text-slate-600">{value}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      accessor: 'userEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      accessor: 'method',
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
        <span className="text-sm font-semibold text-slate-900">${value}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      align: 'right',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => <PaymentStatusBadge status={value} size="xs" />,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Payment Management
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor all payments and transactions
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
          label="Total Payments"
          value={data?.total || 0}
          icon={DollarSign}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Today"
          value={data?.today !== undefined ? `$${data.today}` : '—'}
          icon={DollarSign}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={data?.thisMonth !== undefined ? `$${data.thisMonth}` : '—'}
          icon={DollarSign}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Failed"
          value={data?.failed || 0}
          icon={DollarSign}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={payments}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={DollarSign}
              title="No payments"
              description="Payments will appear here as users transact."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default PaymentManagement;