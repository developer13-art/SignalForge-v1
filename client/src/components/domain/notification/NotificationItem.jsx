import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

const TYPE_ICONS = {
  trade: TrendingUp,
  trade_closed: TrendingDown,
  signal: Zap,
  kyc: Shield,
  payment: CreditCard,
  referral: Users,
  security: AlertTriangle,
  system: Bell,
  success: CheckCircle2,
  default: Bell,
};

const TYPE_COLORS = {
  trade: 'bg-indigo-50 text-indigo-600',
  trade_closed: 'bg-emerald-50 text-emerald-600',
  signal: 'bg-amber-50 text-amber-600',
  kyc: 'bg-sky-50 text-sky-600',
  payment: 'bg-emerald-50 text-emerald-600',
  referral: 'bg-violet-50 text-violet-600',
  security: 'bg-rose-50 text-rose-600',
  system: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-600',
  default: 'bg-slate-100 text-slate-600',
};

const NotificationItem = forwardRef(function NotificationItem(
  {
    notification,
    onClick,
    onMarkRead,
    onDelete,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!notification) {
    return null;
  }

  const { type = 'default', title, description, time, read, action } = notification;

  const Icon = TYPE_ICONS[type] || TYPE_ICONS.default;
  const colorClass = TYPE_COLORS[type] || TYPE_COLORS.default;

  return (
    <div
      ref={ref}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => {
        if (onClick) {
          onClick(notification);
        }
        if (onMarkRead && !read) {
          onMarkRead(notification);
        }
      }}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick(notification);
        }
      }}
      className={[
        'group relative flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors',
        read
          ? 'border-slate-200 bg-white hover:bg-slate-50'
          : 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {!read ? (
        <span
          className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-indigo-500"
          aria-hidden="true"
        />
      ) : null}

      <span
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          colorClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon size={16} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={[
              'text-sm',
              read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {title}
          </p>
          {time ? (
            <time className="shrink-0 text-[11px] text-slate-400">{time}</time>
          ) : null}
        </div>

        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
        ) : null}

        {action ? <div className="mt-2">{action}</div> : null}
      </div>

      {onDelete ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(notification);
          }}
          aria-label="Delete notification"
          className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-rose-600 group-hover:opacity-100"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    title: PropTypes.node,
    description: PropTypes.node,
    time: PropTypes.string,
    read: PropTypes.bool,
    action: PropTypes.node,
  }),
  onClick: PropTypes.func,
  onMarkRead: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default NotificationItem;