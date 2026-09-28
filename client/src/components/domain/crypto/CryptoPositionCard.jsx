import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

const SIDE_STYLES = {
  LONG: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ArrowUpRight,
    iconColor: 'text-emerald-600',
  },
  SHORT: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ArrowDownRight,
    iconColor: 'text-rose-600',
  },
};

function formatNumber(value, decimals = 4) {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '—';
  }
  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function formatCurrency(value, symbol = 'USD') {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '—';
  }
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
}

const CryptoPositionCard = forwardRef(function CryptoPositionCard(
  {
    position,
    onClose,
    onDetails,
    showActions = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  if (!position) {
    return null;
  }

  const sideStyle = SIDE_STYLES[position.side] || SIDE_STYLES.LONG;
  const SideIcon = sideStyle.icon;

  const pnl = Number(position.unrealizedPnl || 0);
  const pnlPositive = pnl > 0;
  const pnlNegative = pnl < 0;

  const pnlColor = pnlPositive
    ? 'text-emerald-600'
    : pnlNegative
    ? 'text-rose-600'
    : 'text-slate-700';

  const PnlIcon = pnlPositive ? TrendingUp : pnlNegative ? TrendingDown : TrendingUp;

  const notional = useMemo(() => {
    const mark = Number(position.markPrice || position.entryPrice || 0);
    const size = Number(position.size || 0);
    return mark * size;
  }, [position]);

  return (
    <div
      ref={ref}
      className={[
        'flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full border',
              sideStyle.badge,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <SideIcon size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{position.symbol}</p>
            <p className="text-xs text-slate-500">
              {position.side} · {formatNumber(position.size, 6)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={[
              'inline-flex items-center gap-1 text-sm font-semibold',
              pnlColor,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <PnlIcon size={12} aria-hidden="true" />
            {formatCurrency(pnl)}
          </span>
          <span className="text-xs text-slate-400">Notional {formatNumber(notional, 2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
        <Cell label="Entry" value={formatNumber(position.entryPrice)} />
        <Cell label="Mark" value={formatNumber(position.markPrice)} />
        <Cell label="Leverage" value={position.leverage ? `${position.leverage}x` : '—'} />
        <Cell
          label="Margin"
          value={position.marginUsed ? formatNumber(position.marginUsed, 2) : '—'}
        />
        <Cell
          label="Liq. Price"
          value={position.liquidationPrice ? formatNumber(position.liquidationPrice) : '—'}
        />
        <Cell
          label="Gateway"
          value={position.gateway ? String(position.gateway).toUpperCase() : '—'}
        />
      </div>

      {showActions ? (
        <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {onDetails ? (
            <button
              type="button"
              onClick={() => onDetails(position)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Details
            </button>
          ) : null}

          {onClose ? (
            <button
              type="button"
              onClick={() => onClose(position)}
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
            >
              Close
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

function Cell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xs text-slate-700">{value}</p>
    </div>
  );
}

CryptoPositionCard.propTypes = {
  position: PropTypes.shape({
    id: PropTypes.string,
    symbol: PropTypes.string,
    side: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    entryPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    markPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    liquidationPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    leverage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginUsed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unrealizedPnl: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    gateway: PropTypes.string,
  }),
  onClose: PropTypes.func,
  onDetails: PropTypes.func,
  showActions: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default CryptoPositionCard;