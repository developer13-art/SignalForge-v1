import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { BadgeCheck, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const VARIANTS = {
  verified: {
    label: 'Verified On-Chain',
    icon: BadgeCheck,
    color: 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200',
  },
  pending: {
    label: 'Verifying',
    icon: Loader2,
    spin: true,
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  failed: {
    label: 'Not Verified',
    icon: AlertCircle,
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const OnChainVerificationBadge = forwardRef(function OnChainVerificationBadge(
  {
    status = 'verified',
    label,
    size = 'sm',
    showIcon = true,
    showLabel = true,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = VARIANTS[status] || VARIANTS.verified;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`On-chain verification: ${label || config.label}`}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        bordered ? 'border' : '',
        config.color,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? (
        <Icon size={sizeConfig.icon} className={config.spin ? 'animate-spin' : ''} aria-hidden="true" />
      ) : null}
      {showLabel ? label || config.label : null}
    </span>
  );
});

OnChainVerificationBadge.propTypes = {
  status: PropTypes.oneOf(['verified', 'pending', 'failed']),
  label: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default OnChainVerificationBadge;