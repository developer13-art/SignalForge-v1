import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: 'bg-white',
  subtle: 'bg-slate-50',
  info: 'bg-sky-50 border-sky-200',
  success: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-rose-50 border-rose-200',
  dark: 'bg-slate-900 text-slate-100',
};

const SIZES = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const RADII = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const Panel = forwardRef(function Panel(
  {
    children,
    variant = 'default',
    size = 'md',
    radius = 'lg',
    bordered = true,
    header,
    headerClassName = '',
    title,
    description,
    actions,
    footer,
    footerClassName = '',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const containerClassName = [
    'flex flex-col overflow-hidden',
    VARIANTS[variant] || VARIANTS.default,
    RADII[radius] || RADII.lg,
    bordered ? 'border border-slate-200' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const paddingClass = SIZES[size] || SIZES.md;

  const hasHeader = Boolean(header) || Boolean(title) || Boolean(description) || Boolean(actions);

  return (
    <div ref={ref} className={containerClassName} data-testid={testId} {...rest}>
      {hasHeader ? (
        <div
          className={[
            'flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3',
            headerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {header || (
            <div className="space-y-1">
              {title ? (
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              ) : null}
              {description ? (
                <p className="text-xs text-slate-500">{description}</p>
              ) : null}
            </div>
          )}

          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className={['flex-1', paddingClass].filter(Boolean).join(' ')}>{children}</div>

      {footer ? (
        <div
          className={[
            'flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3',
            footerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
});

Panel.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'default',
    'subtle',
    'info',
    'success',
    'warning',
    'danger',
    'dark',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  radius: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  bordered: PropTypes.bool,
  header: PropTypes.node,
  headerClassName: PropTypes.string,
  title: PropTypes.node,
  description: PropTypes.node,
  actions: PropTypes.node,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default Panel;
export { VARIANTS as PANEL_VARIANTS };