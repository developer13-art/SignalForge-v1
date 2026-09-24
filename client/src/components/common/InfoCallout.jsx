import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X, Lightbulb } from 'lucide-react';

const VARIANTS = {
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-900',
    icon: Info,
    iconClass: 'text-sky-600',
    titleClass: 'text-sky-900',
    descriptionClass: 'text-sky-800',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    titleClass: 'text-emerald-900',
    descriptionClass: 'text-emerald-800',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    titleClass: 'text-amber-900',
    descriptionClass: 'text-amber-800',
  },
  danger: {
    container: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: AlertCircle,
    iconClass: 'text-rose-600',
    titleClass: 'text-rose-900',
    descriptionClass: 'text-rose-800',
  },
  tip: {
    container: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    icon: Lightbulb,
    iconClass: 'text-indigo-600',
    titleClass: 'text-indigo-900',
    descriptionClass: 'text-indigo-800',
  },
  neutral: {
    container: 'bg-slate-50 border-slate-200 text-slate-900',
    icon: Info,
    iconClass: 'text-slate-600',
    titleClass: 'text-slate-900',
    descriptionClass: 'text-slate-700',
  },
};

const SIZES = {
  sm: {
    container: 'p-3 gap-2.5',
    icon: 16,
    title: 'text-xs font-semibold',
    description: 'text-xs',
  },
  md: {
    container: 'p-4 gap-3',
    icon: 18,
    title: 'text-sm font-semibold',
    description: 'text-sm',
  },
  lg: {
    container: 'p-5 gap-3.5',
    icon: 20,
    title: 'text-base font-semibold',
    description: 'text-sm',
  },
};

const InfoCallout = forwardRef(function InfoCallout(
  {
    variant = 'info',
    size = 'md',
    icon: IconProp,
    title,
    children,
    description,
    action,
    dismissible = false,
    onDismiss,
    bordered = true,
    className = '',
    contentClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const [dismissed, setDismissed] = useState(false);

  const config = VARIANTS[variant] || VARIANTS.info;
  const sizeConfig = SIZES[size] || SIZES.md;
  const Icon = IconProp || config.icon;

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div
      ref={ref}
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      className={[
        'flex items-start rounded-lg',
        config.container,
        bordered ? 'border' : '',
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Icon
        size={sizeConfig.icon}
        className={['mt-0.5 shrink-0', config.iconClass].filter(Boolean).join(' ')}
        aria-hidden="true"
      />

      <div className={['min-w-0 flex-1 space-y-1', contentClassName].filter(Boolean).join(' ')}>
        {title ? (
          <p className={[config.titleClass, sizeConfig.title].filter(Boolean).join(' ')}>
            {title}
          </p>
        ) : null}

        {children ? (
          <div className={[config.descriptionClass, sizeConfig.description].filter(Boolean).join(' ')}>
            {children}
          </div>
        ) : null}

        {description && !children ? (
          <p className={[config.descriptionClass, sizeConfig.description].filter(Boolean).join(' ')}>
            {description}
          </p>
        ) : null}

        {action ? <div className="pt-2">{action}</div> : null}
      </div>

      {dismissible ? (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className={[
            'shrink-0 rounded-md p-1 transition-colors hover:bg-black/5',
            config.iconClass,
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

InfoCallout.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'tip', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  title: PropTypes.node,
  children: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default InfoCallout;
export { VARIANTS as INFO_CALLOUT_VARIANTS, SIZES as INFO_CALLOUT_SIZES };