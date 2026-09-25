import React from 'react';
import PropTypes from 'prop-types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  DollarSign,
  Activity,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Badge from '../../components/common/Badge';
import EnvironmentBadge from '../../components/domain/broker/EnvironmentBadge';
import BrokerConnectionStatus from '../../components/domain/broker/BrokerConnectionStatus';

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

const AccountSummary = function AccountSummary({ account }) {
  if (!account) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Wallet size={18} aria-hidden="true" />
            </span>
            <div>
              <Heading level={3} size="text-base">
                Account Summary
              </Heading>
              <Text color="muted" className="text-xs">
                No broker account connected
              </Text>
            </div>
          </div>
          <Badge variant="neutral" size="sm">
            Not Connected
          </Badge>
        </div>
      </Card>
    );
  }

  const isProfit = Number(account.floatingProfit) >= 0;

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Wallet size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Heading level={3} size="text-base">
                {account.nickname || 'Broker Account'}
              </Heading>
              {account.accountType ? (
                <EnvironmentBadge environment={account.accountType} size="xs" />
              ) : null}
              <BrokerConnectionStatus status={account.status || 'connected'} size="xs" />
            </div>
            <Text color="muted" className="mt-1 text-xs">
              {account.broker} · {account.platform} · {account.login || '—'}
            </Text>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Equity</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatMoney(account.equity, account.currency)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <DollarSign size={10} aria-hidden="true" />
            Balance
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {formatMoney(account.balance, account.currency)}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <Layers size={10} aria-hidden="true" />
            Free Margin
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {formatMoney(account.freeMargin, account.currency)}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {isProfit ? (
              <TrendingUp size={10} aria-hidden="true" />
            ) : (
              <TrendingDown size={10} aria-hidden="true" />
            )}
            Floating P/L
          </p>
          <p
            className={[
              'mt-1 text-base font-semibold',
              isProfit ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {formatMoney(account.floatingProfit, account.currency)}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <Activity size={10} aria-hidden="true" />
            Margin Level
          </p>
          <p
            className={[
              'mt-1 text-base font-semibold',
              Number(account.marginLevel) < 100
                ? 'text-rose-600'
                : Number(account.marginLevel) < 200
                ? 'text-amber-600'
                : 'text-emerald-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {account.marginLevel !== undefined ? `${account.marginLevel}%` : '—'}
          </p>
        </div>
      </div>
    </Card>
  );
};

AccountSummary.propTypes = {
  account: PropTypes.shape({
    nickname: PropTypes.string,
    broker: PropTypes.string,
    platform: PropTypes.string,
    login: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    accountType: PropTypes.oneOf(['live', 'demo']),
    status: PropTypes.string,
    currency: PropTypes.string,
    equity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    freeMargin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    floatingProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    marginLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default AccountSummary;