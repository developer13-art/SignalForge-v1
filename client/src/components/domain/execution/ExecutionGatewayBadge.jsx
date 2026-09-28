import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { DEX_REGISTRY } from '../../../../../shared/src/constants/crypto-pairs/dex-registry';

const ExecutionGatewayBadge = forwardRef(function ExecutionGatewayBadge(
  { gateway, size = 'md', showIcon = true, className = '', testId, ...rest },
  ref,
) {
  if (!gateway) {
    return null;
  }

  const meta = DEX_REGISTRY[String(gateway).toLowerCase()];
  if (!meta) {
    return null;
  }

  const colorClass =
    meta.type === 'perp'
      ? 'bg-violet-50 text-violet-700 border-violet-200'
      : 'bg-indigo-50 text-indigo-700 border-indigo-200';

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wide',
        colorClass,
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon && meta.logo ? (
        <img src={meta.logo} alt="" className="h-3 w-3" aria-hidden="true" />
      ) : null}
      {meta.displayName}
    </span>
  );
});

ExecutionGatewayBadge.propTypes = {
  gateway: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ExecutionGatewayBadge;