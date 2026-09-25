import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: 'max-w-xl',
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[88rem]',
  full: 'max-w-full',
};

const Container = forwardRef(function Container(
  {
    children,
    as: Component = 'div',
    size = 'xl',
    center = true,
    padding = true,
    className = '',
    ...rest
  },
  ref
) {
  return (
    <Component
      ref={ref}
      className={[
        center ? 'mx-auto' : '',
        padding ? 'px-4 sm:px-6 lg:px-8' : '',
        SIZES[size] || SIZES.xl,
        'w-full',
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

Container.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  center: PropTypes.bool,
  padding: PropTypes.bool,
  className: PropTypes.string,
};

export default Container;