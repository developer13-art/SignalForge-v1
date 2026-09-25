import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Ban,
} from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'Pending', variant: 'neutral', icon: Clock },
  open: { label: 'Open', variant: 'primary', icon: Play },
  active: { label: 'Active', variant: 'primary', icon: Play },
  closed: { label: 'Closed', variant: 'success', icon: CheckCircle2 },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
  profit: { label: 'Profit', variant: 'success', icon: TrendingUp },
  loss: { label: 'Loss', variant: 'danger', icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'neutral', icon: Ban },
  failed: { label: 'Failed', variant: 'danger', icon: AlertTriangle },
  stopped: { label: 'Stopped', variant: 'warning', icon: AlertTriangle },
  expired: { label: 'Expired', variant: 'neutral', icon: Clock },
};

const VARIANTS = {
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

const TradeStatusBadge = forwardRef(function TradeStatusBadge(
  {
    status,
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
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[config.variant] || VARIANTS.neutral;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Trade status: ${config.label}`}
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

TradeStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'pending',
    'open',
    'active',
    'closed',
    'completed',
    'profit',
    'loss',
    'cancelled',
    'failed',
    'stopped',
    'expired',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeStatusBadge;
export { STATUS_MAP as TRADE_STATUS_MAP };