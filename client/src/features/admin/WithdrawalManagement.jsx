import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, RefreshCw, Loader2, Check, X } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const WithdrawalManagement = function WithdrawalManagement() {
  const [data, setData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/withdrawals', { credentials: 'include' });
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

  const handleAction = useCallback(async () => {
    if (!confirm) {
      return;
    }
    try {
      await fetch(`/api/admin/withdrawals/${confirm.id}/${confirm.action}`, {
        method: 'POST',
        credentials: 'include',
      });
      setConfirm(null);
      fetchData();
    } catch (_err) {
      // silent
    }
  }, [confirm, fetchData]);

  const columns = [
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
      key: 'destination',
      header: 'Destination',
      accessor: 'destination',
      render: (value) => (
        <span className="truncate font-mono text-[11px] text-slate-500">{value}</span>
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
      render: (value) => (
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            value === 'completed'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'failed' || value === 'rejected'
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
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (value, row) =>
        row.status === 'pending' ? (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setConfirm({ id: row.id, action: 'approve', label: 'Approve withdrawal' });
              }}
              className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
              aria-label="Approve"
            >
              <Check size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setConfirm({ id: row.id, action: 'reject', label: 'Reject withdrawal' });
              }}
              className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
              aria-label="Reject"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ArrowDownToLine size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Withdrawal Management
            </Heading>
            <Text color="muted" className="text-xs">
              Review and process withdrawal requests
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
          label="Pending"
          value={data?.pending || 0}
          icon={ArrowDownToLine}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Processing"
          value={data?.processing || 0}
          icon={ArrowDownToLine}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Completed Today"
          value={data?.completedToday || 0}
          icon={ArrowDownToLine}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Total Pending Amount"
          value={data?.pendingAmount !== undefined ? `$${data.pendingAmount}` : '—'}
          icon={ArrowDownToLine}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={withdrawals}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={ArrowDownToLine}
              title="No withdrawals"
              description="Withdrawal requests will appear here."
            />
          }
        />
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        variant={confirm?.action === 'reject' ? 'danger' : 'info'}
        title={confirm?.label || ''}
        description="Are you sure you want to proceed with this action?"
        confirmLabel="Confirm"
      />
    </Container>
  );
};

export default WithdrawalManagement;