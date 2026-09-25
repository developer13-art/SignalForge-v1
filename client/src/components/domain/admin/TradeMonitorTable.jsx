import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Activity, AlertCircle } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import TradeDirectionBadge from '../trade/TradeDirectionBadge';
import TradeStatusBadge from '../trade/TradeStatusBadge';
import PnLIndicator from '../trade/PnLIndicator';
import EmptyState from '../../common/EmptyState';

const TradeMonitorTable = forwardRef(function TradeMonitorTable(
  {
    trades = [],
    loading = false,
    error,
    onRowClick,
    showUser = true,
    showProvider = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const columns = useMemo(() => {
    const base = [
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
        render: (value, row) => <PnLIndicator value={value} percent={row.profitPercent} size="sm" align="right" />,
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        render: (value, row) => <TradeStatusBadge status={row.status} size="xs" />,
      },
    ];

    if (showUser) {
      base.splice(1, 0, {
        key: 'user',
        header: 'User',
        accessor: 'userName',
        render: (value) => <span className="truncate text-xs text-slate-600">{value || '—'}</span>,
      });
    }

    if (showProvider) {
      base.push({
        key: 'provider',
        header: 'Provider',
        accessor: 'provider',
        align: 'right',
        render: (value) => (
          <span className="truncate text-xs text-slate-500">{value || '—'}</span>
        ),
      });
    }

    return base;
  }, [showUser, showProvider]);

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={trades}
      rowKey="id"
      loading={loading}
      error={error}
      searchable
      sortable
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          icon={Activity}
          title="No active trades"
          description="Live trades will appear here in real time."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

TradeMonitorTable.propTypes = {
  trades: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  showUser: PropTypes.bool,
  showProvider: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeMonitorTable;