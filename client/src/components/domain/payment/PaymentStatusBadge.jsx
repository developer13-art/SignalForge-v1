import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, Ban } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  processing: { label: 'Processing', variant: 'info', icon: RefreshCw, spin: true },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
  succeeded: { label: 'Succeeded', variant: 'success', icon: CheckCircle2 },
  paid: { label: 'Paid', variant: 'success', icon: CheckCircle2 },
  confirmed: { label: 'Confirmed', variant: 'success', icon: CheckCircle2 },
  failed: { label: 'Failed', variant: 'danger', icon: XCircle },
  declined: { label: 'Declined', variant: 'danger', icon: XCircle },
  refunded: { label: 'Refunded', variant: 'neutral', icon: RefreshCw },
  disputed: { label: 'Disputed', variant: 'danger', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', variant: 'neutral', icon: Ban },
  canceled: { label: 'Cancelled', variant: 'neutral', icon: Ban },
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

const PaymentStatusBadge = forwardRef(function PaymentStatusBadge(
  {
    status = 'pending',
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
  const config = STATUS_MAP[key] || STATUS_MAP.pending;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[config.variant] || VARIANTS.neutral;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Payment status: ${config.label}`}
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
      {showIcon ? (
        <Icon size={sizeConfig.icon} className={config.spin ? 'animate-spin' : ''} aria-hidden="true" />
      ) : null}
      {showLabel ? config.label : null}
    </span>
  );
});

PaymentStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'pending',
    'processing',
    'completed',
    'succeeded',
    'paid',
    'confirmed',
    'failed',
    'declined',
    'refunded',
    'disputed',
    'cancelled',
    'canceled',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PaymentStatusBadge;
export { STATUS_MAP as PAYMENT_STATUS_MAP };