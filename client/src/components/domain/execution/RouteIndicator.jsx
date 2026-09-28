import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Route, Info } from 'lucide-react';
import DexBadge from '../crypto/DexBadge';

const RouteIndicator = forwardRef(function RouteIndicator(
  { gateway, status, reason, instrumentClass, attempts, className = '', testId, ...rest },
  ref,
) {
  if (!gateway) {
    return null;
  }

  const statusColor =
    status === 'resolved'
      ? 'text-emerald-600'
      : status === 'fallback'
      ? 'text-amber-600'
      : status === 'rejected'
      ? 'text-rose-600'
      : 'text-slate-500';

  return (
    <div
      ref={ref}
      className={[
        'flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Route size={14} className={statusColor} aria-hidden="true" />

      <span className="text-xs font-medium text-slate-700">Routed to</span>

      <DexBadge gateway={gateway} size="sm" />

      {instrumentClass ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
          {String(instrumentClass).replace(/_/g, ' ')}
        </span>
      ) : null}

      {attempts && attempts > 1 ? (
        <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
          <Info size={10} aria-hidden="true" />
          {attempts} attempts
        </span>
      ) : null}

      {reason ? (
        <span className="ml-auto text-[11px] text-slate-500">{reason}</span>
      ) : null}
    </div>
  );
});

RouteIndicator.propTypes = {
  gateway: PropTypes.string,
  status: PropTypes.oneOf(['resolved', 'fallback', 'rejected', 'error']),
  reason: PropTypes.string,
  instrumentClass: PropTypes.string,
  attempts: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RouteIndicator;