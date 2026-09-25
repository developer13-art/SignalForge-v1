import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Download, Receipt } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import EmptyState from '../../common/EmptyState';

const BillingHistoryTable = forwardRef(function BillingHistoryTable(
  {
    invoices = [],
    loading = false,
    error,
    onRowClick,
    onDownload,
    currency = 'USD',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const columns = useMemo(
    () => [
      {
        key: 'invoiceNumber',
        header: 'Invoice',
        accessor: 'invoiceNumber',
        render: (value) => (
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-slate-400" aria-hidden="true" />
            <span className="font-mono text-sm font-medium text-slate-800">{value}</span>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        accessor: 'date',
        render: (value) => <span className="text-sm text-slate-600">{value}</span>,
      },
      {
        key: 'description',
        header: 'Description',
        accessor: 'description',
        render: (value) => <span className="text-sm text-slate-600">{value}</span>,
      },
      {
        key: 'amount',
        header: 'Amount',
        accessor: 'amount',
        align: 'right',
        render: (value) => (
          <span className="text-sm font-semibold text-slate-900">
            {currency} {value}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        render: (value, row) => <SubscriptionStatusBadge status={row.status} size="xs" />,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (value, row) =>
          onDownload ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDownload(row);
              }}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Download invoice"
            >
              <Download size={14} aria-hidden="true" />
            </button>
          ) : null,
      },
    ],
    [currency, onDownload]
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={invoices}
      rowKey="id"
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          title="No invoices yet"
          description="Your billing history will appear here once you subscribe."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

BillingHistoryTable.propTypes = {
  invoices: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  onDownload: PropTypes.func,
  currency: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BillingHistoryTable;