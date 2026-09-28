import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import DexBadge from './DexBadge';

const RouteFallbackIndicator = forwardRef(function RouteFallbackIndicator(
  { fromGateway, toGateway, reason, className = '', testId, ...rest },
  ref,
) {
  if (!fromGateway || !toGateway) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={[
        'flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <AlertTriangle size={14} className="text-amber-600" aria-hidden="true" />

      <span className="text-xs font-medium text-amber-800">Fallback</span>

      <DexBadge gateway={fromGateway} size="sm" showType={false} />

      <ArrowRight size={12} className="text-amber-600" aria-hidden="true" />

      <DexBadge gateway={toGateway} size="sm" showType={false} />

      {reason ? (
        <span className="ml-auto text-[11px] text-amber-700">{reason}</span>
      ) : null}
    </div>
  );
});

RouteFallbackIndicator.propTypes = {
  fromGateway: PropTypes.string,
  toGateway: PropTypes.string,
  reason: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RouteFallbackIndicator;