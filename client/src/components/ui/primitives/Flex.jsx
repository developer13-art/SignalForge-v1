import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const ALIGN_MAP = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const JUSTIFY_MAP = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const DIRECTION_MAP = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const WRAP_MAP = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
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

const Flex = forwardRef(function Flex(
  {
    children,
    as: Component = 'div',
    align = 'stretch',
    justify = 'start',
    direction = 'row',
    wrap = 'nowrap',
    gap = 0,
    inline = false,
    className = '',
    ...rest
  },
  ref
) {
  return (
    <Component
      ref={ref}
      className={[
        inline ? 'inline-flex' : 'flex',
        ALIGN_MAP[align] || '',
        JUSTIFY_MAP[justify] || '',
        DIRECTION_MAP[direction] || '',
        WRAP_MAP[wrap] || '',
        GAP_MAP[gap] || '',
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

Flex.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  align: PropTypes.oneOf(['start', 'center', 'end', 'baseline', 'stretch']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  direction: PropTypes.oneOf(['row', 'row-reverse', 'col', 'col-reverse']),
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
  gap: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 8, 10, 12]),
  inline: PropTypes.bool,
  className: PropTypes.string,
};

export default Flex;