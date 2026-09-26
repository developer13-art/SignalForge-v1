import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const WithdrawalHistory = function WithdrawalHistory() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/withdrawals', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setWithdrawals(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleBack = useCallback(() => navigate('/wallet'), [navigate]);

  const columns = [
    {
      key: 'requestedAt',
      header: 'Requested',
      accessor: 'requestedAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      accessor: 'method',
      render: (value) => (
        <span className="text-sm capitalize text-slate-700">{value}</span>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      accessor: 'destination',
      render: (value) => (
        <span className="truncate font-mono text-[11px] text-slate-600">{value}</span>
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
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => {
        const colorClass =
          value === 'completed'
            ? 'bg-emerald-50 text-emerald-700'
            : value === 'failed' || value === 'rejected'
            ? 'bg-rose-50 text-rose-700'
            : 'bg-amber-50 text-amber-700';
        return (
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
              colorClass,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {value}
          </span>
        );
      },
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
          onClick={fetchWithdrawals}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Withdrawal History
            </Heading>
            <Text color="muted" className="text-xs">
              All past and current withdrawal requests
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={withdrawals}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={History}
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

export default WithdrawalHistory;