import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: {
    container: 'py-8 px-4',
    iconWrapper: 'h-12 w-12',
    iconSize: 24,
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-12 px-6',
    iconWrapper: 'h-16 w-16',
    iconSize: 32,
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-8',
    iconWrapper: 'h-20 w-20',
    iconSize: 40,
    title: 'text-lg',
    description: 'text-sm',
  },
};

const VARIANTS = {
  default: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
  },
  info: {
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  success: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  danger: {
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
};

const EmptyState = forwardRef(function EmptyState(
  {
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    size = 'md',
    variant = 'default',
    illustration,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.default;

  return (
    <div
      ref={ref}
      className={[
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {illustration ? (
        <div className="mb-4">{illustration}</div>
      ) : Icon ? (
        <div
          className={[
            'mb-4 flex items-center justify-center rounded-full',
            sizeConfig.iconWrapper,
            variantConfig.iconBg,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon
            size={sizeConfig.iconSize}
            className={variantConfig.iconColor}
            aria-hidden="true"
          />
        </div>
      ) : null}

      {title ? (
        <h3
          className={[
            'font-semibold text-slate-900',
            sizeConfig.title,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </h3>
      ) : null}

      {description ? (
        <p
          className={[
            'mt-1 max-w-md text-slate-500',
            sizeConfig.description,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
});

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  secondaryAction: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'info', 'success', 'warning', 'danger']),
  illustration: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default EmptyState;
export { SIZES as EMPTY_STATE_SIZES, VARIANTS as EMPTY_STATE_VARIANTS };