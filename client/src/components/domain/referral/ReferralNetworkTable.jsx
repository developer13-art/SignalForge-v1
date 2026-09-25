import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Users, TrendingUp, Clock } from 'lucide-react';
import DataTable from '../../data-display/DataTable';
import Avatar from '../../common/Avatar';
import EmptyState from '../../common/EmptyState';

const ReferralNetworkTable = forwardRef(function ReferralNetworkTable(
  {
    referrals = [],
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
        key: 'user',
        header: 'Referred User',
        accessor: 'name',
        render: (value, row) => (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" src={row.avatar} name={value} alt={value} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{value}</p>
              {row.email ? (
                <p className="truncate text-xs text-slate-500">{row.email}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        key: 'joinedAt',
        header: 'Joined',
        accessor: 'joinedAt',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        render: (value) => {
          const isActive = value === 'active';
          return (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        key: 'performance',
        header: 'Performance',
        accessor: 'performance',
        align: 'right',
        render: (value) => (
          <span className="text-sm font-medium text-slate-800">
            {currency} {value}
          </span>
        ),
      },
      {
        key: 'reward',
        header: 'Your Reward',
        accessor: 'reward',
        align: 'right',
        render: (value, row) => (
          <span
            className={[
              'text-sm font-semibold',
              row.rewardStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {currency} {value}
          </span>
        ),
      },
      {
        key: 'rewardStatus',
        header: 'Reward Status',
        accessor: 'rewardStatus',
        align: 'right',
        render: (value) => {
          const config = {
            paid: { label: 'Paid', color: 'text-emerald-600', icon: TrendingUp },
            pending: { label: 'Pending', color: 'text-amber-600', icon: Clock },
            review: { label: 'Under Review', color: 'text-sky-600', icon: Clock },
          }[value] || { label: value, color: 'text-slate-500', icon: Clock };
          const Icon = config.icon;
          return (
            <span
              className={['inline-flex items-center gap-1 text-xs font-medium', config.color]
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
      rows={referrals}
      rowKey="id"
      loading={loading}
      error={error}
      searchable
      sortable
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          icon={Users}
          title="No referrals yet"
          description="Share your referral link to start building your network."
          size="sm"
        />
      }
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

ReferralNetworkTable.propTypes = {
  referrals: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  currency: PropTypes.string,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ReferralNetworkTable;