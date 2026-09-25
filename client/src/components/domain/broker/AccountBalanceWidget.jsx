import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Wallet, TrendingUp, TrendingDown, Lock, DollarSign, Activity } from 'lucide-react';
import Card from '../../common/Card';
import EnvironmentBadge from './EnvironmentBadge';

function formatNumber(value, currency = 'USD') {
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

const AccountBalanceWidget = forwardRef(function AccountBalanceWidget(
  {
    balance,
    equity,
    margin,
    freeMargin,
    marginLevel,
    profit,
    profitPercent,
    currency = 'USD',
    environment = 'live',
    accountName,
    accountNumber,
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const isPositive = Number(profit) >= 0;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Account Balance
            </h3>
            <EnvironmentBadge environment={environment} size="xs" />
          </div>
          {accountName ? (
            <p className="mt-1 text-xs text-slate-500">
              {accountName} {accountNumber ? `· ${accountNumber}` : ''}
            </p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Wallet size={18} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Balance
        </p>
        <p
          className={[
            'mt-1 text-3xl font-bold text-slate-900',
            loading ? 'animate-pulse text-slate-300' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {loading ? '—' : formatNumber(balance, currency)}
        </p>
      </div>

      {equity !== undefined ? (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Equity
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {loading ? '—' : formatNumber(equity, currency)}
            </p>
          </div>

          {profit !== undefined ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Floating P/L
              </p>
              <p
                className={[
                  'mt-1 flex items-center gap-1 text-base font-semibold',
                  isPositive ? 'text-emerald-600' : 'text-rose-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isPositive ? (
                  <TrendingUp size={14} aria-hidden="true" />
                ) : (
                  <TrendingDown size={14} aria-hidden="true" />
                )}
                {loading ? '—' : formatNumber(profit, currency)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {margin !== undefined || freeMargin !== undefined ? (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          {margin !== undefined ? (
            <div>
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <Lock size={10} aria-hidden="true" />
                Margin Used
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {loading ? '—' : formatNumber(margin, currency)}
              </p>
            </div>
          ) : null}

          {freeMargin !== undefined ? (
            <div>
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <DollarSign size={10} aria-hidden="true" />
                Free Margin
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {loading ? '—' : formatNumber(freeMargin, currency)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {marginLevel !== undefined ? (
        <div className="mt-4 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Activity size={12} aria-hidden="true" />
            Margin Level
          </p>
          <p
            className={[
              'text-sm font-bold',
              Number(marginLevel) < 100
                ? 'text-rose-600'
                : Number(marginLevel) < 200
                ? 'text-amber-600'
                : 'text-emerald-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {loading ? '—' : `${marginLevel}%`}
          </p>
        </div>
      ) : null}
    </Card>
  );
});

AccountBalanceWidget.propTypes = {
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  equity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  freeMargin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  profit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  profitPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  environment: PropTypes.oneOf(['live', 'demo']),
  accountName: PropTypes.string,
  accountNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default AccountBalanceWidget;