import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import EmptyState from '../../common/EmptyState';

const STATUS_CONFIG = {
  finalized: { label: 'Finalized', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-sky-50 text-sky-700', icon: Clock },
  under_review: {
    label: 'Under Review',
    color: 'bg-sky-50 text-sky-700',
    icon: AlertTriangle,
  },
  failed: { label: 'Failed', color: 'bg-rose-50 text-rose-700', icon: AlertTriangle },
};

const ReferralSettlementTable = forwardRef(function ReferralSettlementTable(
  {
    settlements = [],
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
        key: 'period',
        header: 'Period',
        accessor: 'period',
        render: (value) => (
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <Calendar size={12} className="text-slate-400" aria-hidden="true" />
            {value}
          </span>
        ),
      },
      {
        key: 'referralsCount',
        header: 'Referrals',
        accessor: 'referralsCount',
        align: 'right',
        render: (value) => <span className="text-sm text-slate-700">{value}</span>,
      },
      {
        key: 'grossReward',
        header: 'Gross Reward',
        accessor: 'grossReward',
        align: 'right',
        render: (value) => (
          <span className="text-sm font-medium text-slate-800">
            {currency} {value}
          </span>
        ),
      },
      {
        key: 'adjustments',
        header: 'Adjustments',
        accessor: 'adjustments',
        align: 'right',
        render: (value) =>
          value !== undefined && value !== null ? (
            <span className="text-sm text-slate-600">
              {currency} {value}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: 'netReward',
        header: 'Net Reward',
        accessor: 'netReward',
        align: 'right',
        render: (value) => (
          <span className="text-sm font-bold text-emerald-600">
            {currency} {value}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => {
          const config = STATUS_CONFIG[value] || STATUS_CONFIG.pending;
          const Icon = config.icon;
          return (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                config.color,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon size={10} aria-hidden="true" />
              {config.label}
            </span>
          );
        },
      },
    ],
    [currency]
  );

  return (
    <DataTable
      ref={ref}
      columns={columns}
      rows={settlements}
      rowKey="id"
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          title="No settlements yet"
          description="Your monthly referral settlements will appear here."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

ReferralSettlementTable.propTypes = {
  settlements: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  currency: PropTypes.string,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ReferralSettlementTable;