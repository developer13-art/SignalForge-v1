import React from 'react';
import PropTypes from 'prop-types';
import { Users, ArrowRight, Gift } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

function formatMoney(value, currency = 'USD') {
  if (value === undefined || value === null) {
    return `${currency} 0.00`;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return `${currency} ${value}`;
  }
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ReferralSummaryWidget = function ReferralSummaryWidget({ referral, onViewMore }) {
  if (!referral) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Users size={18} aria-hidden="true" />
            </span>
            <div>
              <Heading level={3} size="text-base">
                Referrals
              </Heading>
              <Text color="muted" className="text-xs">
                Invite others, earn rewards
              </Text>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => {
            window.location.href = '/referrals';
          }}>
            Get Started
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Gift size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Referrals
            </Heading>
            <Text color="muted" className="text-xs">
              {referral.totalReferrals || 0} referred user
              {referral.totalReferrals !== 1 ? 's' : ''}
            </Text>
          </div>
        </div>

        {onViewMore ? (
          <Button variant="ghost" size="sm" onClick={onViewMore} trailingIcon={ArrowRight}>
            View
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Active Referrals
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {referral.activeReferrals || 0}
          </p>
        </div>

        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
            Available Rewards
          </p>
          <p className="mt-1 text-base font-bold text-emerald-700">
            {formatMoney(referral.availableRewards, referral.currency)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Pending</span>
          <span className="font-medium text-amber-600">
            {formatMoney(referral.pendingRewards, referral.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Lifetime</span>
          <span className="font-medium text-slate-800">
            {formatMoney(referral.lifetimeEarned, referral.currency)}
          </span>
        </div>
      </div>
    </Card>
  );
};

ReferralSummaryWidget.propTypes = {
  referral: PropTypes.shape({
    totalReferrals: PropTypes.number,
    activeReferrals: PropTypes.number,
    availableRewards: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pendingRewards: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lifetimeEarned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
  }),
  onViewMore: PropTypes.func,
};

export default ReferralSummaryWidget;