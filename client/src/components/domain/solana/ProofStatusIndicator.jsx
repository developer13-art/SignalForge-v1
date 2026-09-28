import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const STATUS_MAP = {
  pending: {
    icon: Clock,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    label: 'Pending',
  },
  submitting: {
    icon: Loader2,
    color: 'text-sky-600',
    bg: 'bg-sky-100',
    label: 'Submitting',
    spin: true,
  },
  submitted: {
    icon: Clock,
    color: 'text-sky-600',
    bg: 'bg-sky-100',
    label: 'Submitted',
  },
  confirmed: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    label: 'Confirmed',
  },
  failed: {
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    label: 'Failed',
  },
  expired: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    label: 'Expired',
  },
};

const SIZES = {
  sm: { wrapper: 'h-6 w-6', icon: 12, text: 'text-[10px]' },
  md: { wrapper: 'h-8 w-8', icon: 16, text: 'text-xs' },
  lg: { wrapper: 'h-10 w-10', icon: 20, text: 'text-sm' },
};

const ProofStatusIndicator = forwardRef(function ProofStatusIndicator(
  {
    status = 'pending',
    size = 'md',
    showLabel = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  const sizeConfig = SIZES[size] || SIZES.md;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <span
        className={[
          'inline-flex items-center justify-center rounded-full',
          config.bg,
          config.color,
          sizeConfig.wrapper,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={config.label}
      >
        <Icon
          size={sizeConfig.icon}
          className={config.spin ? 'animate-spin' : ''}
          aria-hidden="true"
        />
      </span>
      {showLabel ? (
        <span className={['font-medium text-slate-700', sizeConfig.text].join(' ')}>
          {config.label}
        </span>
      ) : null}
    </span>
  );
});

ProofStatusIndicator.propTypes = {
  status: PropTypes.oneOf(['pending', 'submitting', 'submitted', 'confirmed', 'failed', 'expired']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProofStatusIndicator;
export { STATUS_MAP as PROOF_STATUS_MAP };