import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Users, TrendingUp, Clock, Wallet, UserCheck, Activity } from 'lucide-react';
import Card from '../../common/Card';

const STAT_CONFIG = [
  {
    key: 'totalReferrals',
    label: 'Total Referrals',
    icon: Users,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    key: 'activeReferrals',
    label: 'Active Referrals',
    icon: UserCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    key: 'monthlyPerformance',
    label: 'Monthly Performance',
    icon: TrendingUp,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    prefix: '$',
  },
  {
    key: 'pendingRewards',
    label: 'Pending Rewards',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    prefix: '$',
  },
  {
    key: 'availableRewards',
    label: 'Available Rewards',
    icon: Wallet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    prefix: '$',
  },
  {
    key: 'lifetimeEarned',
    label: 'Lifetime Earned',
    icon: Activity,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    prefix: '$',
  },
];

const ReferralStatsCard = forwardRef(function ReferralStatsCard(
  {
    stats = {},
    columns = 3,
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const gridCols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Referral Overview
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Track your referral performance and rewards in real time.
      </p>

      <div className={['mt-4 grid grid-cols-2 gap-3', gridCols].filter(Boolean).join(' ')}>
        {STAT_CONFIG.map((stat) => {
          const value = stats[stat.key];
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-md',
                    stat.bg,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon size={14} className={stat.color} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p
                className={[
                  'mt-0.5 text-lg font-bold text-slate-900',
                  loading ? 'animate-pulse text-slate-300' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {loading
                  ? '—'
                  : value !== undefined && value !== null
                  ? `${stat.prefix || ''}${value}`
                  : '0'}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

ReferralStatsCard.propTypes = {
  stats: PropTypes.shape({
    totalReferrals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeReferrals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monthlyPerformance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pendingRewards: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    availableRewards: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lifetimeEarned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  columns: PropTypes.oneOf([2, 3, 4]),
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ReferralStatsCard;
export { STAT_CONFIG as REFERRAL_STAT_CONFIG };