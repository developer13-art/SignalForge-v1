import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'py-2 px-3 text-[11px]',
  md: 'py-3 px-4 text-xs',
  lg: 'py-4 px-4 text-sm',
};

const VARIANTS = {
  default: 'bg-slate-50 text-slate-500',
  light: 'bg-white text-slate-600 border-b border-slate-200',
  dark: 'bg-slate-900 text-slate-200',
  primary: 'bg-indigo-50 text-indigo-700',
};

const TableHeader = forwardRef(function TableHeader(
  {
    children,
    size = 'md',
    variant = 'default',
    sticky = false,
    uppercase = true,
    tracking = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <thead
      ref={ref}
      className={[
        variantClass,
        sticky ? 'sticky top-0 z-10' : '',
        uppercase ? 'uppercase' : '',
        tracking ? 'tracking-wide' : '',
        'font-semibold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              className: [child.props.className, sizeClass].filter(Boolean).join(' '),
            })
          : child,
      )}
    </thead>
  );
});

TableHeader.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'light', 'dark', 'primary']),
  sticky: PropTypes.bool,
  uppercase: PropTypes.bool,
  tracking: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TableHeader;
export { SIZES as TABLE_HEADER_SIZES, VARIANTS as TABLE_HEADER_VARIANTS };