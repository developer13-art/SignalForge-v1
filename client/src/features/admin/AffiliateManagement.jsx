import React, { useCallback, useEffect, useState } from 'react';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';
import { Users, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const AffiliateManagement = function AffiliateManagement() {
  const [data, setData] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [partnersResponse, statusResponse] = await Promise.all([
        fetch('/api/admin/affiliate/partners?limit=100'),
        fetch('/api/admin/affiliate/partners/status-breakdown'),
      ]);
      const [partnersPayload, statusPayload] = await Promise.all([
        partnersResponse.json(),
        statusResponse.json(),
      ]);
      if (partnersResponse.ok && statusResponse.ok) {
        const partners = partnersPayload.data?.items || [];
        setAffiliates(
          partners.map((partner) => ({
            ...partner,
            id: partner.partnerId,
            name: partner.userEmail,
            email: partner.userEmail,
            referrals: partner.referralCount,
            status: partner.status?.toLowerCase(),
          })),
        );
        setData({
          total: partnersPayload.data?.meta?.total,
          active: statusPayload.data?.breakdown?.ACTIVE,
        });
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
      header: 'Affiliate',
      accessor: 'name',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      accessor: 'email',
      render: (value) => (
        <span className="truncate text-xs text-slate-600">{value}</span>
      ),
    },
    {
      key: 'referrals',
      header: 'Referrals',
      accessor: 'referrals',
      align: 'right',
      render: (value) => <span className="text-sm text-slate-800">{value || 0}</span>,
    },
    {
      key: 'commissions',
      header: 'Commissions',
      accessor: 'commissions',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">
          {value === undefined ? '—' : `$${value}`}
        </span>
      ),
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
            value === 'active'
              ? 'bg-emerald-50 text-emerald-700'
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
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Affiliate Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage affiliate partners and commissions across the platform
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
          label="Total Affiliates"
          value={data?.total ?? '—'}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={data?.active ?? '—'}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Total Commissions"
          value={data?.totalCommissions !== undefined ? `$${data.totalCommissions}` : '—'}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={data?.monthlyCommissions !== undefined ? `$${data.monthlyCommissions}` : '—'}
          icon={Users}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={affiliates}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Users}
              title="No affiliates yet"
              description="Affiliates will appear as they join the platform."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default AffiliateManagement;