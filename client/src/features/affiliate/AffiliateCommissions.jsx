import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const AffiliateCommissions = function AffiliateCommissions() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/commissions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setCommissions(payload.data?.items || []);
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

  const handleBack = useCallback(() => navigate('/affiliate'), [navigate]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'referral',
      header: 'Referral',
      accessor: 'referralName',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
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
      header: 'Commission',
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
      render: (value) => (
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            value === 'paid'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'pending'
              ? 'bg-amber-50 text-amber-700'
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
          label="Total Commissions"
          value={data?.total !== undefined ? `$${data.total}` : '—'}
          icon={Wallet}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Paid"
          value={data?.paid !== undefined ? `$${data.paid}` : '—'}
          icon={Wallet}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={data?.pending !== undefined ? `$${data.pending}` : '—'}
          icon={Wallet}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={data?.thisMonth !== undefined ? `$${data.thisMonth}` : '—'}
          icon={Wallet}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Commissions
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={commissions}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={Wallet}
                title="No commissions yet"
                description="Commissions from your referrals will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default AffiliateCommissions;