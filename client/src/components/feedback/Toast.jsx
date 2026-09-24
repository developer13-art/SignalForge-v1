import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  X,
  Loader2,
} from 'lucide-react';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-white',
    accent: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    title: 'text-emerald-900',
    description: 'text-emerald-700',
  },
  error: {
    icon: XCircle,
    container: 'border-rose-200 bg-white',
    accent: 'bg-rose-500',
    iconColor: 'text-rose-500',
    title: 'text-rose-900',
    description: 'text-rose-700',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-200 bg-white',
    accent: 'bg-amber-500',
    iconColor: 'text-amber-500',
    title: 'text-amber-900',
    description: 'text-amber-700',
  },
  info: {
    icon: Info,
    container: 'border-sky-200 bg-white',
    accent: 'bg-sky-500',
    iconColor: 'text-sky-500',
    title: 'text-sky-900',
    description: 'text-sky-700',
  },
  loading: {
    icon: Loader2,
    container: 'border-slate-200 bg-white',
    accent: 'bg-indigo-500',
    iconColor: 'text-indigo-500',
    title: 'text-slate-900',
    description: 'text-slate-600',
  },
  default: {
    icon: Info,
    container: 'border-slate-200 bg-white',
    accent: 'bg-slate-500',
    iconColor: 'text-slate-500',
    title: 'text-slate-900',
    description: 'text-slate-600',
  },
};

const Toast = forwardRef(function Toast(
  {
    id,
    variant = 'default',
    title,
    description,
    icon: CustomIcon,
    duration = 5000,
    onClose,
    onDismiss,
    closable = true,
    action,
    progress = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = VARIANTS[variant] || VARIANTS.default;
  const Icon = CustomIcon || config.icon;
  const isSpinning = variant === 'loading';
  const [remaining, setRemaining] = useState(duration);

  const handleClose = () => {
    if (onClose) {
      onClose(id);
    } else if (onDismiss) {
      onDismiss(id);
    }
  };

  useEffect(() => {
    if (!duration || duration <= 0 || variant === 'loading') {
      return undefined;
    }

    const startTime = Date.now();
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    let progressTimer;
    if (progress) {
      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const left = Math.max(0, duration - elapsed);
        setRemaining(left);
      }, 50);
    }

    return () => {
      clearTimeout(timer);
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, variant, progress]);

  const progressPercent = duration > 0 ? (remaining / duration) * 100 : 0;

  return (
    <div
      ref={ref}
      role="alert"
      className={[
        'relative flex w-full items-start gap-3 overflow-hidden rounded-lg border shadow-lg',
        config.container,
        'px-4 py-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <span
        className={['absolute left-0 top-0 h-full w-1', config.accent].filter(Boolean).join(' ')}
        aria-hidden="true"
      />

      <div className="flex shrink-0 pt-0.5">
        <Icon
          size={20}
          className={[config.iconColor, isSpinning ? 'animate-spin' : '']
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        {title ? (
          <p className={['text-sm font-semibold', config.title].filter(Boolean).join(' ')}>
            {title}
          </p>
        ) : null}

        {description ? (
          <p
            className={[
              'mt-0.5 text-sm',
              config.description,
              title ? '' : 'font-medium',
            ]
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
          onClick={handleClose}
          aria-label="Close notification"
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}

      {progress && duration > 0 && variant !== 'loading' ? (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
          <div
            className={['h-full transition-[width] duration-100 ease-linear', config.accent]
              .filter(Boolean)
              .join(' ')}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      ) : null}
    </div>
  );
});

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'loading', 'default']),
  title: PropTypes.node,
  description: PropTypes.node,
  icon: PropTypes.elementType,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  onDismiss: PropTypes.func,
  closable: PropTypes.bool,
  action: PropTypes.node,
  progress: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default Toast;
export { VARIANTS as TOAST_VARIANTS };