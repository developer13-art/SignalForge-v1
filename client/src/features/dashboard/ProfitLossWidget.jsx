import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SparklineChart from '../../components/charts/SparklineChart';

function formatMoney(value, currency = 'USD') {
  if (value === undefined || value === null) {
    return '—';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const ProfitLossWidget = function ProfitLossWidget({ performance, onViewAnalytics }) {
  if (!performance) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <BarChart3 size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              Profit and Loss
            </Heading>
            <Text color="muted" className="text-xs">
              Performance metrics
            </Text>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">Performance data not available yet.</p>
      </Card>
    );
  }

  const isProfit = Number(performance.totalProfit) >= 0;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isProfit ? (
              <TrendingUp size={18} aria-hidden="true" />
            ) : (
              <TrendingDown size={18} aria-hidden="true" />
            )}
          </span>
          <div>
            <Heading level={3} size="text-base">
              Profit and Loss
            </Heading>
            <Text color="muted" className="text-xs">
              Last 30 days
            </Text>
          </div>
        </div>

        {onViewAnalytics ? (
          <Button variant="ghost" size="sm" onClick={onViewAnalytics} trailingIcon={ArrowRight}>
            Analytics
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        <p
          className={[
            'text-3xl font-bold',
            isProfit ? 'text-emerald-600' : 'text-rose-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isProfit ? '+' : ''}
          {formatMoney(performance.totalProfit, performance.currency)}
        </p>
        {performance.profitPercent !== undefined ? (
          <p
            className={[
              'mt-1 text-sm font-medium',
              isProfit ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isProfit ? '+' : ''}
            {performance.profitPercent}% return
          </p>
        ) : null}
      </div>

      {performance.sparkline && performance.sparkline.length > 0 ? (
        <div className="mt-4">
          <SparklineChart
            data={performance.sparkline}
            dataKey="value"
            width={320}
            height={48}
            variant="area"
            color={isProfit ? '#10b981' : '#e11d48'}
            showLastDot
            className="w-full"
          />
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Win Rate
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {performance.winRate !== undefined ? `${performance.winRate}%` : '—'}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Trades
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {performance.totalTrades || 0}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Best Trade
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-600">
            {formatMoney(performance.bestTrade, performance.currency)}
          </p>
        </div>
      </div>
    </Card>
  );
};

ProfitLossWidget.propTypes = {
  performance: PropTypes.shape({
    totalProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    profitPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    winRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalTrades: PropTypes.number,
    bestTrade: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    sparkline: PropTypes.array,
  }),
  onViewAnalytics: PropTypes.func,
};

export default ProfitLossWidget;