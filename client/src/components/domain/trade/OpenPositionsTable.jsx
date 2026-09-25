import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../data-display/DataTable';
import TradeDirectionBadge from './TradeDirectionBadge';
import TradeStatusBadge from './TradeStatusBadge';
import PnLIndicator from './PnLIndicator';
import EmptyState from '../../common/EmptyState';

const OpenPositionsTable = forwardRef(function OpenPositionsTable(
  {
    positions = [],
    loading = false,
    error,
    onRowClick,
    onClosePosition,
    onModifyPosition,
    selectable = false,
    selectedKeys = [],
    onSelectionChange,
    showProvider = true,
    showActions = true,
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
        render: (value) => <span className="font-medium">{value}</span>,
      },
      {
        key: 'entryPrice',
        header: 'Entry',
        accessor: 'entryPrice',
        align: 'right',
      },
      {
        key: 'currentPrice',
        header: 'Current',
        accessor: 'currentPrice',
        align: 'right',
      },
      {
        key: 'profit',
        header: 'P/L',
        accessor: 'profit',
        align: 'right',
        render: (value, row) => (
          <PnLIndicator value={value} percent={row.profitPercent} size="sm" align="right" />
        ),
      },
      {
        key: 'duration',
        header: 'Duration',
        accessor: 'duration',
        align: 'right',
      },
    ];

    if (showProvider) {
      baseColumns.splice(5, 0, {
        key: 'provider',
        header: 'Provider',
        accessor: 'provider',
        render: (value) => (
          <span className="truncate text-sm text-slate-600">{value || '—'}</span>
        ),
      });
    }

    if (showActions) {
      baseColumns.push({
        key: 'actions',
        header: '',
        align: 'right',
        render: (value, row) => (
          <div className="flex items-center justify-end gap-1">
            {onModifyPosition ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onModifyPosition(row);
                }}
                className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Modify
              </button>
            ) : null}
            {onClosePosition ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClosePosition(row);
                }}
                className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Close
              </button>
            ) : null}
          </div>
        ),
      });
    }

    return baseColumns;
  }, [showProvider, showActions, onClosePosition, onModifyPosition]);

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={positions}
      rowKey="id"
      loading={loading}
      error={error}
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          title="No open positions"
          description="You do not have any open positions at the moment."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

OpenPositionsTable.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  onClosePosition: PropTypes.func,
  onModifyPosition: PropTypes.func,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  showProvider: PropTypes.bool,
  showActions: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default OpenPositionsTable;