import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const LEVELS = {
  1: {
    as: 'h1',
    size: 'text-4xl sm:text-5xl',
    weight: 'font-bold',
    leading: 'leading-tight',
  },
  2: {
    as: 'h2',
    size: 'text-3xl sm:text-4xl',
    weight: 'font-bold',
    leading: 'leading-tight',
  },
  3: {
    as: 'h3',
    size: 'text-2xl sm:text-3xl',
    weight: 'font-semibold',
    leading: 'leading-snug',
  },
  4: {
    as: 'h4',
    size: 'text-xl sm:text-2xl',
    weight: 'font-semibold',
    leading: 'leading-snug',
  },
  5: {
    as: 'h5',
    size: 'text-lg sm:text-xl',
    weight: 'font-semibold',
    leading: 'leading-snug',
  },
  6: {
    as: 'h6',
    size: 'text-base sm:text-lg',
    weight: 'font-semibold',
    leading: 'leading-snug',
  },
};

const COLORS = {
  default: 'text-slate-900',
  muted: 'text-slate-600',
  primary: 'text-indigo-600',
  white: 'text-white',
  inherit: '',
};

const Heading = forwardRef(function Heading(
  {
    children,
    level = 2,
    as,
    size,
    weight,
    color = 'default',
    align = 'left',
    truncate = false,
    className = '',
    ...rest
  },
  ref
) {
  const config = LEVELS[level] || LEVELS[2];
  const Component = as || config.as;

  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
      ? 'text-right'
      : 'text-left';

  return (
    <Component
      ref={ref}
      className={[
        size || config.size,
        weight || config.weight,
        config.leading,
        COLORS[color] || COLORS.default,
        alignClass,
        truncate ? 'truncate' : '',
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

Heading.propTypes = {
  children: PropTypes.node,
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  as: PropTypes.elementType,
  size: PropTypes.string,
  weight: PropTypes.string,
  color: PropTypes.oneOf(['default', 'muted', 'primary', 'white', 'inherit']),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  truncate: PropTypes.bool,
  className: PropTypes.string,
};

export default Heading;