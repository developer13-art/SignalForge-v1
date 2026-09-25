import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Radio,
  Brain,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const STATUS_MAP = {
  received: { label: 'Received', variant: 'info', icon: Radio },
  classified: { label: 'Classified', variant: 'info', icon: Brain },
  parsing: { label: 'Parsing', variant: 'info', icon: Brain },
  parsed: { label: 'Parsed', variant: 'primary', icon: Brain },
  validating: { label: 'Validating', variant: 'info', icon: ShieldCheck },
  validated: { label: 'Validated', variant: 'primary', icon: ShieldCheck },
  approved: { label: 'Approved', variant: 'success', icon: ShieldCheck },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
  executed: { label: 'Executed', variant: 'success', icon: Zap },
  pending: { label: 'Pending', variant: 'neutral', icon: Clock },
  failed: { label: 'Failed', variant: 'danger', icon: AlertTriangle },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
  expired: { label: 'Expired', variant: 'neutral', icon: Clock },
  duplicate: { label: 'Duplicate', variant: 'warning', icon: AlertTriangle },
};

const VARIANTS = {
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const SignalStatusBadge = forwardRef(function SignalStatusBadge(
  {
    status,
    size = 'sm',
    showIcon = true,
    showLabel = true,
    bordered = true,
    pulse = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[config.variant] || VARIANTS.neutral;
  const Icon = config.icon;

  const isActive = ['received', 'parsing', 'validating', 'executed'].includes(status);

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Signal status: ${config.label}`}
      className={[
        'inline-flex items-center font-semibold',
        bordered ? 'border' : '',
        variantClass,
        sizeConfig.container,
        'rounded-full',
        pulse && isActive ? 'animate-pulse' : '',
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

SignalStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'received',
    'classified',
    'parsing',
    'parsed',
    'validating',
    'validated',
    'approved',
    'rejected',
    'executed',
    'pending',
    'failed',
    'completed',
    'expired',
    'duplicate',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  pulse: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalStatusBadge;
export { STATUS_MAP as SIGNAL_STATUS_MAP };