import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';

const VARIANTS = {
  default: 'border-slate-200 bg-white hover:bg-slate-50',
  primary: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100',
  success: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
  warning: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
  danger: 'border-rose-200 bg-rose-50 hover:bg-rose-100',
};

const SIZES = {
  sm: { padding: 'p-2.5', gap: 'gap-2.5', title: 'text-xs', description: 'text-[11px]', time: 'text-[10px]', avatar: 'sm' },
  md: { padding: 'p-3.5', gap: 'gap-3', title: 'text-sm', description: 'text-xs', time: 'text-[11px]', avatar: 'md' },
  lg: { padding: 'p-4', gap: 'gap-3.5', title: 'text-base', description: 'text-sm', time: 'text-xs', avatar: 'lg' },
};

const Notification = forwardRef(function Notification(
  {
    variant = 'default',
    size = 'md',
    icon,
    avatar,
    title,
    description,
    time,
    dateTime,
    read = false,
    unreadDot = false,
    action,
    onClick,
    closable = false,
    onClose,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event) => {
    if (!isInteractive) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      ref={ref}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={[
        'relative flex items-start border rounded-lg transition-colors',
        variantClass,
        sizeConfig.padding,
        sizeConfig.gap,
        isInteractive ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500' : '',
        !read ? 'ring-1 ring-indigo-100' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {unreadDot && !read ? (
        <span
          className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500"
          aria-hidden="true"
        />
      ) : null}

      {avatar ? (
        <Avatar
          size={sizeConfig.avatar}
          src={avatar.src || avatar}
          name={avatar.name || title}
          alt={avatar.name || title}
        />
      ) : icon ? (
        <span
          className={[
            'flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600',
            size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {React.createElement(icon, {
            size: size === 'sm' ? 14 : size === 'lg' ? 20 : 16,
            'aria-hidden': true,
          })}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          {title ? (
            <p
              className={[
                'font-semibold text-slate-900',
                sizeConfig.title,
                !read ? '' : 'opacity-80',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </p>
          ) : null}

          {time ? (
            <time
              className={['shrink-0 text-slate-400', sizeConfig.time].filter(Boolean).join(' ')}
              dateTime={dateTime}
            >
              {time}
            </time>
          ) : null}
        </div>

        {description ? (
          <p
            className={['mt-0.5 text-slate-600', sizeConfig.description]
              .filter(Boolean)
              .join(' ')}
          >
            {description}
          </p>
        ) : null}

        {action ? <div className="mt-2">{action}</div> : null}
      </div>

      {closable ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (onClose) {
              onClose(event);
            }
          }}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});

Notification.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  avatar: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ src: PropTypes.string, name: PropTypes.string }),
  ]),
  title: PropTypes.node,
  description: PropTypes.node,
  time: PropTypes.node,
  dateTime: PropTypes.string,
  read: PropTypes.bool,
  unreadDot: PropTypes.bool,
  action: PropTypes.node,
  onClick: PropTypes.func,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default Notification;
export { VARIANTS as NOTIFICATION_VARIANTS, SIZES as NOTIFICATION_SIZES };