import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Lightbulb,
} from 'lucide-react';

const VARIANTS = {
  info: {
    icon: Info,
    container: 'border-sky-200 bg-sky-50 text-sky-900',
    iconColor: 'text-sky-600',
    title: 'text-sky-900',
    description: 'text-sky-800',
    close: 'text-sky-500 hover:bg-sky-100 hover:text-sky-800',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconColor: 'text-emerald-600',
    title: 'text-emerald-900',
    description: 'text-emerald-800',
    close: 'text-emerald-500 hover:bg-emerald-100 hover:text-emerald-800',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    iconColor: 'text-amber-600',
    title: 'text-amber-900',
    description: 'text-amber-800',
    close: 'text-amber-500 hover:bg-amber-100 hover:text-amber-800',
  },
  danger: {
    icon: AlertCircle,
    container: 'border-rose-200 bg-rose-50 text-rose-900',
    iconColor: 'text-rose-600',
    title: 'text-rose-900',
    description: 'text-rose-800',
    close: 'text-rose-500 hover:bg-rose-100 hover:text-rose-800',
  },
  tip: {
    icon: Lightbulb,
    container: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    iconColor: 'text-indigo-600',
    title: 'text-indigo-900',
    description: 'text-indigo-800',
    close: 'text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800',
  },
  neutral: {
    icon: Info,
    container: 'border-slate-200 bg-slate-50 text-slate-900',
    iconColor: 'text-slate-600',
    title: 'text-slate-900',
    description: 'text-slate-700',
    close: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
  },
};

const SIZES = {
  sm: { container: 'p-3 gap-2.5', icon: 16, title: 'text-xs font-semibold', description: 'text-xs' },
  md: { container: 'p-4 gap-3', icon: 18, title: 'text-sm font-semibold', description: 'text-sm' },
  lg: { container: 'p-5 gap-3.5', icon: 20, title: 'text-base font-semibold', description: 'text-sm' },
};

const Alert = forwardRef(function Alert(
  {
    variant = 'info',
    size = 'md',
    icon: CustomIcon,
    title,
    children,
    description,
    action,
    closable = false,
    onClose,
    dismissible,
    showIcon = true,
    rounded = true,
    bordered = true,
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    testId,
    ...rest
  },
  ref
) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const config = VARIANTS[variant] || VARIANTS.info;
  const sizeConfig = SIZES[size] || SIZES.md;
  const Icon = CustomIcon || config.icon;
  const canClose = closable || dismissible;

  const handleClose = () => {
    setDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={ref}
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      className={[
        'flex items-start',
        bordered ? 'border' : '',
        rounded ? 'rounded-lg' : '',
        config.container,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? (
        <Icon
          size={sizeConfig.icon}
          className={['mt-0.5 shrink-0', config.iconColor].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      ) : null}

      <div className="min-w-0 flex-1 space-y-1">
        {title ? (
          <p
            className={[config.title, sizeConfig.title, titleClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {title}
          </p>
        ) : null}

        {children ? (
          <div
            className={[config.description, sizeConfig.description, descriptionClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        ) : null}

        {description && !children ? (
          <p
            className={[config.description, sizeConfig.description, descriptionClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {description}
          </p>
        ) : null}

        {action ? <div className="pt-2">{action}</div> : null}
      </div>

      {canClose ? (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss"
          className={[
            'shrink-0 rounded-md p-1 transition-colors',
            config.close,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <X size={sizeConfig.icon - 2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

Alert.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'tip', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  title: PropTypes.node,
  children: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  closable: PropTypes.bool,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  showIcon: PropTypes.bool,
  rounded: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  descriptionClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Alert;
export { VARIANTS as ALERT_VARIANTS, SIZES as ALERT_SIZES };