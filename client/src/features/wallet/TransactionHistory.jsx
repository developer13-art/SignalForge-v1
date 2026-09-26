import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, ArrowLeft, Loader2, RefreshCw, Filter } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'credit', label: 'Credits' },
  { value: 'debit', label: 'Debits' },
  { value: 'referral', label: 'Referrals' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'payment', label: 'Payments' },
  { value: 'refund', label: 'Refunds' },
];

const TransactionHistory = function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 25,
  });

  const fetchTransactions = useCallback(async (page = 1, pageSize = 25, filterType = type) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      if (filterType) {
        params.append('type', filterType);
      }

      const response = await fetch(`/api/wallet/transactions?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setTransactions(payload.data?.items || []);
        setPagination({
          currentPage: payload.data?.currentPage || 1,
          totalPages: payload.data?.totalPages || 1,
          totalItems: payload.data?.totalItems || 0,
          pageSize: payload.data?.pageSize || pageSize,
        });
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchTransactions(1, pagination.pageSize, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleBack = useCallback(() => navigate('/wallet'), [navigate]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (value) => (
        <span
          className={[
            'rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            ['credit', 'referral', 'refund'].includes(value)
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      accessor: 'description',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>,
    },
    {
      key: 'reference',
      header: 'Reference',
      accessor: 'reference',
      render: (value) => (
        <span className="font-mono text-[11px] text-slate-500">{value}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      render: (value, row) => {
        const isCredit = ['credit', 'referral', 'refund'].includes(row.type);
        return (
          <span
            className={[
              'text-sm font-semibold',
              isCredit ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isCredit ? '+' : '-'}${value}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Balance',
      accessor: 'balance',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">${value}</span>
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
          onClick={() => fetchTransactions(pagination.currentPage, pagination.pageSize, type)}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ListChecks size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Transaction History
            </Heading>
            <Text color="muted" className="text-xs">
              Complete list of all wallet transactions
            </Text>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Filter size={14} className="text-slate-400" aria-hidden="true" />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={transactions}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalItems: pagination.totalItems,
              pageSize: pagination.pageSize,
              onPageChange: (page) =>
                fetchTransactions(page, pagination.pageSize, type),
              onPageSizeChange: (size) => fetchTransactions(1, size, type),
              showPageSizeSelector: true,
            }}
          />
        </div>
      </Card>
    </Container>
  );
};

export default TransactionHistory;