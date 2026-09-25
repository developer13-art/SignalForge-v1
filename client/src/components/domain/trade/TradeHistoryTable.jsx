import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../data-display/DataTable';
import TradeDirectionBadge from './TradeDirectionBadge';
import TradeStatusBadge from './TradeStatusBadge';
import PnLIndicator from './PnLIndicator';
import EmptyState from '../../common/EmptyState';

const TradeHistoryTable = forwardRef(function TradeHistoryTable(
  {
    trades = [],
    loading = false,
    error,
    onRowClick,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    showProvider = true,
    showDates = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'symbol',
        header: 'Symbol',
        accessor: 'symbol',
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{value}</span>
            <TradeDirectionBadge direction={row.direction} size="xs" />
          </div>
        ),
      },
      {
        key: 'volume',
        header: 'Volume',
        accessor: 'volume',
        align: 'right',
      },
      {
        key: 'entryPrice',
        header: 'Entry',
        accessor: 'entryPrice',
        align: 'right',
      },
      {
        key: 'exitPrice',
        header: 'Exit',
        accessor: 'exitPrice',
        align: 'right',
      },
      {
        key: 'profit',
        header: 'Net P/L',
        accessor: 'profit',
        align: 'right',
        render: (value, row) => (
          <PnLIndicator value={value} percent={row.profitPercent} size="sm" align="right" />
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        render: (value, row) => <TradeStatusBadge status={row.status} size="xs" />,
      },
    ];

    if (showProvider) {
      baseColumns.splice(3, 0, {
        key: 'provider',
        header: 'Provider',
        accessor: 'provider',
        render: (value) => (
          <span className="truncate text-sm text-slate-600">{value || '—'}</span>
        ),
      });
    }

    if (showDates) {
      baseColumns.push({
        key: 'closedAt',
        header: 'Closed',
        accessor: 'closedAt',
        align: 'right',
        render: (value) => (
          <span className="whitespace-nowrap text-xs text-slate-500">{value || '—'}</span>
        ),
      });
    }

    return baseColumns;
  }, [showProvider, showDates]);

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={trades}
      rowKey="id"
      loading={loading}
      error={error}
      sortable
      searchable
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          title="No trades found"
          description="Your trade history will appear here once you execute trades."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

TradeHistoryTable.propTypes = {
  trades: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  showProvider: PropTypes.bool,
  showDates: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeHistoryTable;