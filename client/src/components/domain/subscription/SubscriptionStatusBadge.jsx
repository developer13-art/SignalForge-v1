import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Ban, Sparkles } from 'lucide-react';

const STATUS_MAP = {
  active: { label: 'Active', variant: 'success', icon: CheckCircle2 },
  trial: { label: 'Trial', variant: 'info', icon: Sparkles },
  trialing: { label: 'Trialing', variant: 'info', icon: Sparkles },
  past_due: { label: 'Past Due', variant: 'warning', icon: AlertTriangle },
  grace_period: { label: 'Grace Period', variant: 'warning', icon: Clock },
  expired: { label: 'Expired', variant: 'neutral', icon: Clock },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
  canceled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
  suspended: { label: 'Suspended', variant: 'danger', icon: Ban },
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
};

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const SubscriptionStatusBadge = forwardRef(function SubscriptionStatusBadge(
  {
    status = 'active',
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
  const key = String(status).toLowerCase();
  const config = STATUS_MAP[key] || STATUS_MAP.active;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[config.variant] || VARIANTS.neutral;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Subscription status: ${config.label}`}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        bordered ? 'border' : '',
        variantClass,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
      {showLabel ? config.label : null}
    </span>
  );
});

SubscriptionStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'active',
    'trial',
    'trialing',
    'past_due',
    'grace_period',
    'expired',
    'cancelled',
    'canceled',
    'suspended',
    'pending',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SubscriptionStatusBadge;
export { STATUS_MAP as SUBSCRIPTION_STATUS_MAP };