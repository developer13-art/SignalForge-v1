import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Wallet, TrendingUp, Clock, Lock, ArrowDownToLine } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';

function formatMoney(value, currency = 'USD') {
  if (value === undefined || value === null) {
    return '—';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

const WalletBalanceCard = forwardRef(function WalletBalanceCard(
  {
    available = 0,
    pending = 0,
    lifetimeEarned,
    lifetimeWithdrawn,
    locked = 0,
    currency = 'USD',
    loading = false,
    onWithdraw,
    onViewHistory,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Wallet Balance
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Funds available for withdrawal or subscription payment
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Wallet size={20} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Available
        </p>
        <p
          className={[
            'mt-1 text-3xl font-bold text-slate-900',
            loading ? 'animate-pulse text-slate-300' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {loading ? '—' : formatMoney(available, currency)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            <Clock size={10} aria-hidden="true" />
            Pending
          </p>
          <p className="mt-1 text-base font-semibold text-amber-600">
            {loading ? '—' : formatMoney(pending, currency)}
          </p>
        </div>

        {locked !== undefined ? (
          <div>
            <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <Lock size={10} aria-hidden="true" />
              Locked
            </p>
            <p className="mt-1 text-base font-semibold text-slate-600">
              {loading ? '—' : formatMoney(locked, currency)}
            </p>
          </div>
        ) : null}
      </div>

      {lifetimeEarned !== undefined || lifetimeWithdrawn !== undefined ? (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          {lifetimeEarned !== undefined ? (
            <div>
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <TrendingUp size={10} aria-hidden="true" />
                Lifetime Earned
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">
                {formatMoney(lifetimeEarned, currency)}
              </p>
            </div>
          ) : null}

          {lifetimeWithdrawn !== undefined ? (
            <div>
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <ArrowDownToLine size={10} aria-hidden="true" />
                Total Withdrawn
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatMoney(lifetimeWithdrawn, currency)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {(onWithdraw || onViewHistory) ? (
        <div className="mt-5 flex items-center gap-2">
          {onWithdraw ? (
            <Button variant="primary" onClick={onWithdraw} className="flex-1">
              Withdraw Funds
            </Button>
          ) : null}
          {onViewHistory ? (
            <Button variant="outline" onClick={onViewHistory}>
              History
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
});

WalletBalanceCard.propTypes = {
  available: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pending: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lifetimeEarned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lifetimeWithdrawn: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  locked: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  loading: PropTypes.bool,
  onWithdraw: PropTypes.func,
  onViewHistory: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default WalletBalanceCard;