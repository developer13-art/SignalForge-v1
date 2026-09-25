import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Pause, Clock } from 'lucide-react';

const STATUS_MAP = {
  connected: { label: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  disconnected: { label: 'Disconnected', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', icon: XCircle },
  connecting: { label: 'Connecting', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', icon: Loader2, spin: true },
  syncing: { label: 'Syncing', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', icon: Loader2, spin: true },
  error: { label: 'Error', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', icon: XCircle },
  warning: { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle },
  paused: { label: 'Paused', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', icon: Pause },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10, dot: 'h-1.5 w-1.5' },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12, dot: 'h-2 w-2' },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14, dot: 'h-2.5 w-2.5' },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16, dot: 'h-3 w-3' },
};

const DOT_COLORS = {
  connected: 'bg-emerald-500',
  disconnected: 'bg-slate-400',
  connecting: 'bg-sky-500',
  syncing: 'bg-sky-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  paused: 'bg-slate-400',
  pending: 'bg-amber-500',
};

const BrokerConnectionStatus = forwardRef(function BrokerConnectionStatus(
  {
    status = 'disconnected',
    size = 'sm',
    showIcon = true,
    showDot = false,
    showLabel = true,
    bordered = true,
    pulse = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = STATUS_MAP[status] || STATUS_MAP.disconnected;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const Icon = config.icon;

  const isAnimated = config.spin || (pulse && status === 'connected');

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Connection status: ${config.label}`}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        bordered ? 'border' : '',
        config.bg,
        config.color,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showDot ? (
        <span
          className={[
            'rounded-full',
            DOT_COLORS[status] || DOT_COLORS.disconnected,
            sizeConfig.dot,
            isAnimated ? 'animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      ) : null}

      {showIcon && !showDot ? (
        <Icon
          size={sizeConfig.icon}
          className={config.spin ? 'animate-spin' : ''}
          aria-hidden="true"
        />
      ) : null}

      {showLabel ? config.label : null}
    </span>
  );
});

BrokerConnectionStatus.propTypes = {
  status: PropTypes.oneOf([
    'connected',
    'disconnected',
    'connecting',
    'syncing',
    'error',
    'warning',
    'paused',
    'pending',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showDot: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  pulse: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BrokerConnectionStatus;
export { STATUS_MAP as BROKER_CONNECTION_STATUSES };