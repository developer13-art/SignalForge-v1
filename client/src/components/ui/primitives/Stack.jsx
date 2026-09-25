import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

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
  16: 'gap-16',
};

const Stack = forwardRef(function Stack(
  {
    children,
    as: Component = 'div',
    direction = 'col',
    gap = 4,
    align = 'stretch',
    justify = 'start',
    divider,
    className = '',
    ...rest
  },
  ref
) {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  const alignClass =
    align === 'start'
      ? 'items-start'
      : align === 'center'
      ? 'items-center'
      : align === 'end'
      ? 'items-end'
      : 'items-stretch';
  const justifyClass =
    justify === 'start'
      ? 'justify-start'
      : justify === 'center'
      ? 'justify-center'
      : justify === 'end'
      ? 'justify-end'
      : justify === 'between'
      ? 'justify-between'
      : 'justify-start';

  const childrenArray = React.Children.toArray(children);

  const content = divider
    ? childrenArray.reduce((acc, child, index) => {
        acc.push(child);
        if (index < childrenArray.length - 1) {
          acc.push(
            <span key={`divider-${index}`} className="contents">
              {divider}
            </span>
          );
        }
        return acc;
      }, [])
    : children;

  return (
    <Component
      ref={ref}
      className={[
        'flex',
        directionClass,
        alignClass,
        justifyClass,
        GAP_MAP[gap] || 'gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {content}
    </Component>
  );
});

Stack.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  direction: PropTypes.oneOf(['row', 'col']),
  gap: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16]),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between']),
  divider: PropTypes.node,
  className: PropTypes.string,
};

export default Stack;