import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const IbReferrals = function IbReferrals() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ib/referrals', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setReferrals(payload.data?.items || []);
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

  const handleBack = useCallback(() => navigate('/ib'), [navigate]);

  const columns = [
    {
      key: 'accountName',
      header: 'Account',
      accessor: 'accountName',
      render: (value) => (
        <span className="text-sm font-medium text-slate-900">{value}</span>
      ),
    },
    {
      key: 'broker',
      header: 'Broker',
      accessor: 'broker',
      render: (value) => <span className="text-xs text-slate-700">{value}</span>,
    },
    {
      key: 'accountType',
      header: 'Type',
      accessor: 'accountType',
      render: (value) => (
        <span className="text-xs capitalize text-slate-600">{value}</span>
      ),
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      accessor: 'joinedAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'revenue',
      header: 'IB Revenue',
      accessor: 'revenue',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">${value || 0}</span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
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

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total IB Referrals"
          value={data?.total || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={data?.active || 0}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Live Accounts"
          value={data?.liveAccounts || 0}
          icon={Users}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Total Revenue"
          value={data?.revenue !== undefined ? `$${data.revenue}` : '—'}
          icon={Users}
          variant="success"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          IB Referrals
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={referrals}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={Users}
                title="No IB referrals yet"
                description="Share your broker links to start tracking IB referrals."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default IbReferrals;