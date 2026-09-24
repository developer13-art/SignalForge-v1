import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: 'bg-white hover:bg-slate-50',
  striped: 'odd:bg-white even:bg-slate-50 hover:bg-slate-100',
  selected: 'bg-indigo-50 hover:bg-indigo-100',
  danger: 'bg-rose-50 hover:bg-rose-100',
  warning: 'bg-amber-50 hover:bg-amber-100',
  success: 'bg-emerald-50 hover:bg-emerald-100',
  disabled: 'bg-slate-100 text-slate-400',
};

const TableRow = forwardRef(function TableRow(
  {
    children,
    variant = 'default',
    selected = false,
    disabled = false,
    clickable = false,
    onClick,
    className = '',
    cellClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const isInteractive = (clickable || Boolean(onClick)) && !disabled;

  const variantClass = disabled
    ? VARIANTS.disabled
    : selected
    ? VARIANTS.selected
    : VARIANTS[variant] || VARIANTS.default;

  const handleKeyDown = (event) => {
    if (!isInteractive) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  };

  return (
    <tr
      ref={ref}
      className={[
        'transition-colors duration-100',
        variantClass,
        isInteractive ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-selected={selected || undefined}
      aria-disabled={disabled || undefined}
      data-testid={testId}
      {...rest}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              className: [child.props.className, cellClassName].filter(Boolean).join(' '),
            })
          : child,
      )}
    </tr>
  );
});

TableRow.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'default',
    'striped',
    'selected',
    'danger',
    'warning',
    'success',
    'disabled',
  ]),
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  cellClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default TableRow;
export { VARIANTS as TABLE_ROW_VARIANTS };