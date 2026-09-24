import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const ALIGNMENTS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const VARIANTS = {
  default: 'text-slate-700',
  muted: 'text-slate-500',
  strong: 'font-semibold text-slate-900',
  danger: 'text-rose-600 font-medium',
  success: 'text-emerald-600 font-medium',
  warning: 'text-amber-600 font-medium',
  mono: 'font-mono text-xs',
};

const PADDINGS = {
  none: 'p-0',
  sm: 'py-2 px-3',
  md: 'py-3 px-4',
  lg: 'py-4 px-4',
};

const TableCell = forwardRef(function TableCell(
  {
    children,
    as = 'td',
    variant = 'default',
    align = 'left',
    padding = 'md',
    truncate = false,
    wrap = false,
    colSpan,
    rowSpan,
    scope,
    className = '',
    title,
    testId,
    ...rest
  },
  ref,
) {
  const Component = as === 'th' ? 'th' : 'td';

  return (
    <Component
      ref={ref}
      colSpan={colSpan}
      rowSpan={rowSpan}
      scope={Component === 'th' ? scope || 'col' : undefined}
      title={title}
      className={[
        'align-middle',
        PADDINGS[padding] || PADDINGS.md,
        ALIGNMENTS[align] || ALIGNMENTS.left,
        VARIANTS[variant] || VARIANTS.default,
        truncate ? 'max-w-0 truncate' : '',
        !wrap && !truncate ? 'whitespace-nowrap' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Component>
  );
});

TableCell.propTypes = {
  children: PropTypes.node,
  as: PropTypes.oneOf(['td', 'th']),
  variant: PropTypes.oneOf([
    'default',
    'muted',
    'strong',
    'danger',
    'success',
    'warning',
    'mono',
  ]),
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  truncate: PropTypes.bool,
  wrap: PropTypes.bool,
  colSpan: PropTypes.number,
  rowSpan: PropTypes.number,
  scope: PropTypes.oneOf(['col', 'row', 'colgroup', 'rowgroup']),
  className: PropTypes.string,
  title: PropTypes.string,
  testId: PropTypes.string,
};

export default TableCell;
export { ALIGNMENTS as TABLE_CELL_ALIGNMENTS, VARIANTS as TABLE_CELL_VARIANTS };