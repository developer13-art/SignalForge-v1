import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Zap } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import SignalStatusBadge from '../signal/SignalStatusBadge';
import SignalConfidenceBadge from '../signal/SignalConfidenceBadge';
import SignalSourceBadge from '../signal/SignalSourceBadge';
import EmptyState from '../../common/EmptyState';

const SignalMonitorTable = forwardRef(function SignalMonitorTable(
  {
    signals = [],
    loading = false,
    error,
    onRowClick,
    showProvider = true,
    showSource = true,
    showConfidence = true,
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
            <span
              className={[
                'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                row.direction === 'BUY'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {row.direction}
            </span>
          </div>
        ),
      },
      {
        key: 'entry',
        header: 'Entry',
        accessor: 'entry',
        align: 'right',
        render: (value) => <span className="text-sm text-slate-700">{value || 'Market'}</span>,
      },
      {
        key: 'stopLoss',
        header: 'SL',
        accessor: 'stopLoss',
        align: 'right',
        render: (value) => <span className="text-sm text-rose-600">{value || '—'}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => <SignalStatusBadge status={value} size="xs" />,
      },
    ];

    if (showConfidence) {
      base.splice(4, 0, {
        key: 'confidence',
        header: 'Confidence',
        accessor: 'confidence',
        align: 'right',
        render: (value) => <SignalConfidenceBadge confidence={value} size="xs" />,
      });
    }

    if (showProvider) {
      base.splice(1, 0, {
        key: 'provider',
        header: 'Provider',
        accessor: 'providerName',
        render: (value) => <span className="truncate text-xs text-slate-600">{value || '—'}</span>,
      });
    }

    if (showSource) {
      base.push({
        key: 'source',
        header: 'Source',
        accessor: 'source',
        align: 'right',
        render: (value) => <SignalSourceBadge source={value} size="xs" />,
      });
    }

    return base;
  }, [showProvider, showSource, showConfidence]);

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={signals}
      rowKey="id"
      loading={loading}
      error={error}
      searchable
      sortable
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          icon={Zap}
          title="No signals"
          description="Live signals will appear here in real time."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

SignalMonitorTable.propTypes = {
  signals: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRowClick: PropTypes.func,
  showProvider: PropTypes.bool,
  showSource: PropTypes.bool,
  showConfidence: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalMonitorTable;