import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Clock, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Pending' },
  submitted: { icon: Clock, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Submitted' },
  partial: { icon: PauseCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Partial' },
  filled: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Filled' },
  cancelled: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Cancelled' },
  failed: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100', label: 'Failed' },
  expired: { icon: XCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Expired' },
};

function formatPrice(value) {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '—';
  }
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

const CryptoOrderCard = forwardRef(function CryptoOrderCard(
  { order, onCancel, onDetails, className = '', testId, ...rest },
  ref,
) {
  if (!order) {
    return null;
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const sideClass =
    order.side === 'buy' || order.side === 'BUY'
      ? 'text-emerald-600'
      : 'text-rose-600';

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
        <div>
          <p className="text-sm font-semibold text-slate-900">{order.symbol}</p>
          <p className="text-xs text-slate-500">
            <span className={sideClass}>{String(order.side).toUpperCase()}</span>
            {' · '}
            {order.orderType || order.order_type || 'market'}
          </p>
        </div>

        <span
          className={[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            config.bg,
            config.color,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <StatusIcon size={10} aria-hidden="true" />
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
        <Cell label="Size" value={formatPrice(order.size)} />
        <Cell label="Price" value={formatPrice(order.price)} />
        <Cell label="Leverage" value={order.leverage ? `${order.leverage}x` : '—'} />
        <Cell
          label="Reduce Only"
          value={order.reduceOnly || order.reduce_only ? 'Yes' : 'No'}
        />
      </div>

      {onCancel || onDetails ? (
        <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {onDetails ? (
            <button
              type="button"
              onClick={() => onDetails(order)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Details
            </button>
          ) : null}

          {onCancel && ['pending', 'submitted', 'partial'].includes(order.status) ? (
            <button
              type="button"
              onClick={() => onCancel(order)}
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
            >
              Cancel
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

CryptoOrderCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string,
    symbol: PropTypes.string,
    side: PropTypes.string,
    orderType: PropTypes.string,
    order_type: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    leverage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reduceOnly: PropTypes.bool,
    reduce_only: PropTypes.bool,
    status: PropTypes.string,
  }),
  onCancel: PropTypes.func,
  onDetails: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default CryptoOrderCard;