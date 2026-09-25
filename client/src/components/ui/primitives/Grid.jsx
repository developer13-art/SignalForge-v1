import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const COLS_MAP = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const GAP_MAP = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

const Grid = forwardRef(function Grid(
  {
    children,
    as: Component = 'div',
    cols = 1,
    colsSm,
    colsMd,
    colsLg,
    colsXl,
    gap = 0,
    gapX,
    gapY,
    inline = false,
    className = '',
    ...rest
  },
  ref
) {
  const colsClass = COLS_MAP[cols] || COLS_MAP[1];
  const smClass = colsSm ? `sm:${COLS_MAP[colsSm] || ''}` : '';
  const mdClass = colsMd ? `md:${COLS_MAP[colsMd] || ''}` : '';
  const lgClass = colsLg ? `lg:${COLS_MAP[colsLg] || ''}` : '';
  const xlClass = colsXl ? `xl:${COLS_MAP[colsXl] || ''}` : '';

  const gapClass = GAP_MAP[gap] || '';
  const gapXClass = gapX !== undefined ? `gap-x-${gapX}` : '';
  const gapYClass = gapY !== undefined ? `gap-y-${gapY}` : '';

  return (
    <Component
      ref={ref}
      className={[
        inline ? 'inline-grid' : 'grid',
        colsClass,
        smClass,
        mdClass,
        lgClass,
        xlClass,
        gapClass,
        gapXClass,
        gapYClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Component>
  );
});

Grid.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  cols: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  colsSm: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  colsMd: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  colsLg: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  colsXl: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  gap: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 8, 10, 12]),
  gapX: PropTypes.number,
  gapY: PropTypes.number,
  inline: PropTypes.bool,
  className: PropTypes.string,
};

export default Grid;