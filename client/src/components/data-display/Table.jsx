import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const VARIANTS = {
  default: 'border border-slate-200',
  bordered: 'border border-slate-300',
  ghost: 'border-0',
};

const Table = forwardRef(function Table(
  {
    children,
    size = 'md',
    variant = 'default',
    striped = false,
    hoverable = false,
    bordered = false,
    compact = false,
    stickyHeader = false,
    responsive = true,
    className = '',
    wrapperClassName = '',
    caption,
    captionPosition = 'top',
    testId,
    ...rest
  },
  ref,
) {
  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  const tableElement = (
    <table
      ref={ref}
      className={[
        'min-w-full divide-y divide-slate-200 text-left',
        sizeClass,
        variantClass,
        striped ? 'table-striped' : '',
        hoverable ? 'table-hover' : '',
        bordered ? 'table-bordered' : '',
        compact ? 'table-compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {caption && captionPosition === 'top' ? (
        <caption className="mb-2 text-left text-sm font-medium text-slate-500">
          {caption}
        </caption>
      ) : null}

      {children}

      {caption && captionPosition === 'bottom' ? (
        <caption className="mt-2 text-left text-sm text-slate-500">{caption}</caption>
      ) : null}
    </table>
  );

  if (!responsive) {
    return tableElement;
  }

  return (
    <div
      className={[
        'overflow-x-auto rounded-lg border border-slate-200',
        stickyHeader ? 'max-h-[70vh] overflow-y-auto' : '',
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tableElement}
    </div>
  );
});

Table.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'bordered', 'ghost']),
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  bordered: PropTypes.bool,
  compact: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  responsive: PropTypes.bool,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  caption: PropTypes.node,
  captionPosition: PropTypes.oneOf(['top', 'bottom']),
  testId: PropTypes.string,
};

export default Table;
export { SIZES as TABLE_SIZES, VARIANTS as TABLE_VARIANTS };