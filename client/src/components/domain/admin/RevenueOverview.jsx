import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Users, Award, Gift } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import SparklineChart from '../../charts/SparklineChart';

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

const RevenueOverview = forwardRef(function RevenueOverview(
  {
    subscriptionRevenue,
    marketplaceRevenue,
    providerRevenue,
    affiliateRevenue,
    referralCost,
    netRevenue,
    growthPercent,
    growthDirection,
    sparklineData,
    currency = 'USD',
    period = '30d',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const isPositive = Number(growthPercent) >= 0;

  const items = [
    {
      key: 'subscription',
      label: 'Subscription Revenue',
      value: subscriptionRevenue,
      icon: CreditCard,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      key: 'marketplace',
      label: 'Marketplace Revenue',
      value: marketplaceRevenue,
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      key: 'provider',
      label: 'Provider Revenue',
      value: providerRevenue,
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      key: 'affiliate',
      label: 'Affiliate Revenue',
      value: affiliateRevenue,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      key: 'referralCost',
      label: 'Referral Cost',
      value: referralCost,
      icon: Gift,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ].filter((item) => item.value !== undefined && item.value !== null);

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Revenue Overview
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">Aggregated platform revenue · {period}</p>
          </div>
        </div>

        {growthPercent !== undefined ? (
          <div className="text-right">
            <p
              className={[
                'flex items-center justify-end gap-1 text-base font-bold',
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
              {isPositive ? '+' : ''}
              {growthPercent}%
            </p>
            <p className="text-[10px] text-slate-500">vs previous period</p>
          </div>
        ) : null}
      </div>

      {netRevenue !== undefined ? (
        <>
          <Separator spacing="md" />
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
              Net Revenue
            </p>
            <p
              className={[
                'mt-1 text-3xl font-bold text-emerald-800',
                loading ? 'animate-pulse text-emerald-300' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {loading ? '—' : formatMoney(netRevenue, currency)}
            </p>
          </div>
        </>
      ) : null}

      {sparklineData && sparklineData.length > 0 ? (
        <>
          <Separator spacing="md" />
          <SparklineChart
            data={sparklineData}
            dataKey="value"
            width={320}
            height={48}
            variant="area"
            color="#10b981"
            showLastDot
            className="w-full"
          />
        </>
      ) : null}

      <Separator spacing="md" />

      <ul className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-md',
                    item.bg,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon size={14} className={item.color} aria-hidden="true" />
                </span>
                <span className="text-sm text-slate-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {loading ? '—' : formatMoney(item.value, currency)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
});

RevenueOverview.propTypes = {
  subscriptionRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marketplaceRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  providerRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  affiliateRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  referralCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  netRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  growthPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  growthDirection: PropTypes.oneOf(['up', 'down', 'flat']),
  sparklineData: PropTypes.array,
  currency: PropTypes.string,
  period: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RevenueOverview;