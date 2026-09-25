import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, BookOpen } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import EmptyState from '../../common/EmptyState';

const TYPE_CONFIG = {
  credit: { icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  debit: { icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
  referral: { icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  withdrawal: { icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
  payment: { icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
  refund: { icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const WalletLedgerTable = forwardRef(function WalletLedgerTable(
  {
    entries = [],
    loading = false,
    error,
    currency = 'USD',
    onRowClick,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const columns = useMemo(
    () => [
      {
        key: 'type',
        header: 'Type',
        accessor: 'type',
        render: (value) => {
          const config = TYPE_CONFIG[value] || TYPE_CONFIG.credit;
          const Icon = config.icon;
          return (
            <span
              className={[
                'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                config.bg,
                config.color,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon size={12} aria-hidden="true" />
              {value}
            </span>
          );
        },
      },
      {
        key: 'description',
        header: 'Description',
        accessor: 'description',
        render: (value) => (
          <span className="text-sm text-slate-700">{value}</span>
        ),
      },
      {
        key: 'reference',
        header: 'Reference',
        accessor: 'reference',
        render: (value) => (
          <span className="font-mono text-xs text-slate-500">{value}</span>
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
              {isCredit ? '+' : '-'}
              {currency} {value}
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
          <span className="text-sm font-medium text-slate-800">
            {currency} {value}
          </span>
        ),
      },
    ],
    [currency]
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={entries}
      rowKey="id"
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      searchable
      sortable
      emptyState={
        <EmptyState
          icon={BookOpen}
          title="No ledger entries"
          description="Your wallet transactions will appear here."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

WalletLedgerTable.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  currency: PropTypes.string,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default WalletLedgerTable;