import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Gift, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../../common/Card';

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  under_review: {
    label: 'Under Review',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    icon: AlertTriangle,
  },
  rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertTriangle },
};

const ReferralRewardCard = forwardRef(function ReferralRewardCard(
  {
    reward,
    currency = 'USD',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!reward) {
    return null;
  }

  const { referredUser, period, eligibleProfit, rewardRate, rewardAmount, status, paidAt } = reward;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <Card ref={ref} padding="md" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Gift size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{referredUser}</p>
            <p className="text-xs text-slate-500">{period}</p>
          </div>
        </div>

        <span
          className={[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            statusConfig.bg,
            statusConfig.color,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <StatusIcon size={10} aria-hidden="true" />
          {statusConfig.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Eligible Profit
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {currency} {eligibleProfit}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Reward Rate
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{rewardRate}%</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Your Reward
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-emerald-600">
            <TrendingUp size={12} aria-hidden="true" />
            {currency} {rewardAmount}
          </p>
        </div>
      </div>

      {paidAt ? (
        <p className="mt-2 text-[11px] text-slate-400">Paid on {paidAt}</p>
      ) : null}
    </Card>
  );
});

ReferralRewardCard.propTypes = {
  reward: PropTypes.shape({
    referredUser: PropTypes.string,
    period: PropTypes.string,
    eligibleProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rewardRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rewardAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.oneOf(['paid', 'pending', 'under_review', 'rejected']),
    paidAt: PropTypes.string,
  }),
  currency: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ReferralRewardCard;