import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, RefreshCw, ArrowDownToLine } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const ProviderWithdrawals = function ProviderWithdrawals() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/withdrawals', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setWithdrawals(payload.data?.items || []);
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

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  const columns = [
    {
      key: 'requestedAt',
      header: 'Requested',
      accessor: 'requestedAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
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
      key: 'method',
      header: 'Method',
      accessor: 'method',
      render: (value) => <span className="text-xs capitalize text-slate-700">{value}</span>,
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
            value === 'completed'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'failed'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-amber-50 text-amber-700',
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/provider/withdrawals/new')}
            leadingIcon={ArrowDownToLine}
          >
            Request Withdrawal
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Available Balance"
          value={data?.available !== undefined ? `$${data.available}` : '—'}
          icon={Wallet}
          variant="success"
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
          label="Lifetime Withdrawn"
          value={data?.lifetimeWithdrawn !== undefined ? `$${data.lifetimeWithdrawn}` : '—'}
          icon={Wallet}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Next Payout"
          value={data?.nextPayout || '—'}
          icon={Wallet}
          variant="primary"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Withdrawal Requests
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={withdrawals}
            rowKey="id"
            loading={loading}
            emptyState={
              <EmptyState
                icon={Wallet}
                title="No withdrawals yet"
                description="Your withdrawal requests will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default ProviderWithdrawals;