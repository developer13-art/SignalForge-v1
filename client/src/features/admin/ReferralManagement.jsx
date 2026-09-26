import React, { useCallback, useEffect, useState } from 'react';
import { Users, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const ReferralManagement = function ReferralManagement() {
  const [data, setData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/referrals', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setRewards(payload.data?.items || []);
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
      key: 'referrer',
      header: 'Referrer',
      accessor: 'referrerName',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'referred',
      header: 'Referred',
      accessor: 'referredName',
      render: (value) => (
        <span className="text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      accessor: 'period',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'amount',
      header: 'Reward',
      accessor: 'amount',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">${value}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => {
        const variants = {
          paid: 'success',
          pending: 'warning',
          under_review: 'info',
          rejected: 'danger',
        };
        return (
          <Badge variant={variants[value] || 'neutral'} size="xs">
            {value}
          </Badge>
        );
      },
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage the platform-wide referral program
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
          label="Total Referrals"
          value={data?.totalReferrals || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active Referrers"
          value={data?.activeReferrers || 0}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Total Rewards"
          value={data?.totalRewards !== undefined ? `$${data.totalRewards}` : '—'}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Under Review"
          value={data?.underReview !== undefined ? `$${data.underReview}` : '—'}
          icon={Users}
          variant="warning"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={rewards}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Users}
              title="No referral rewards"
              description="Referral rewards will appear here after settlement."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default ReferralManagement;