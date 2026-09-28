import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import ExecutionGatewayBadge from './ExecutionGatewayBadge';

const RouteFallbackBanner = forwardRef(function RouteFallbackBanner(
  { fromGateway, toGateway, reason, message, className = '', testId, ...rest },
  ref,
) {
  if (!fromGateway || !toGateway) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="status"
      className={[
        'flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <AlertTriangle size={16} className="text-amber-600" aria-hidden="true" />

      <span className="text-sm font-semibold text-amber-900">
        {message || 'Execution route changed'}
      </span>

      <ExecutionGatewayBadge gateway={fromGateway} size="sm" />

      <span className="text-sm text-amber-700">→</span>

      <ExecutionGatewayBadge gateway={toGateway} size="sm" />

      {reason ? (
        <span className="ml-auto text-xs text-amber-700">{reason}</span>
      ) : null}
    </div>
  );
});

RouteFallbackBanner.propTypes = {
  fromGateway: PropTypes.string,
  toGateway: PropTypes.string,
  reason: PropTypes.string,
  message: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RouteFallbackBanner;