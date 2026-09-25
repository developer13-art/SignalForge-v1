import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import EmptyState from '../../common/EmptyState';

function formatCurrency(value, currency = 'USD') {
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

const SymbolPerformanceWidget = forwardRef(function SymbolPerformanceWidget(
  {
    symbols = [],
    maxItems = 8,
    currency = 'USD',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sortedSymbols = useMemo(
    () =>
      [...symbols]
        .sort((a, b) => Number(b.profit || 0) - Number(a.profit || 0))
        .slice(0, maxItems),
    [symbols, maxItems]
  );

  const maxAbs = useMemo(
    () =>
      sortedSymbols.reduce((acc, symbol) => {
        const abs = Math.abs(Number(symbol.profit) || 0);
        return abs > acc ? abs : acc;
      }, 0),
    [sortedSymbols]
  );

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Symbol Performance
          </h3>
          <p className="mt-1 text-xs text-slate-500">Top performing instruments</p>
        </div>
      </div>

      <Separator spacing="md" />

      {sortedSymbols.length === 0 ? (
        <EmptyState
          title="No symbol data"
          description="Trade performance by symbol will appear here."
          size="sm"
        />
      ) : (
        <ul className="space-y-3">
          {sortedSymbols.map((symbol) => {
            const profit = Number(symbol.profit) || 0;
            const isPositive = profit >= 0;
            const barWidth = maxAbs === 0 ? 0 : (Math.abs(profit) / maxAbs) * 100;

            return (
              <li key={symbol.symbol} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm font-semibold text-slate-800">
                  {symbol.symbol}
                </span>

                <div className="relative flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={[
                        'h-full rounded-full',
                        isPositive ? 'bg-emerald-500' : 'bg-rose-500',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                <span
                  className={[
                    'flex w-24 shrink-0 items-center justify-end gap-1 text-sm font-semibold',
                    isPositive ? 'text-emerald-600' : 'text-rose-600',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isPositive ? (
                    <TrendingUp size={12} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={12} aria-hidden="true" />
                  )}
                  {loading ? '—' : formatCurrency(profit, currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
});

SymbolPerformanceWidget.propTypes = {
  symbols: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      profit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  maxItems: PropTypes.number,
  currency: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SymbolPerformanceWidget;