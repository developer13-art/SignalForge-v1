import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Box = forwardRef(function Box(
  {
    children,
    as: Component = 'div',
    className = '',
    display,
    position,
    overflow,
    width,
    height,
    padding,
    margin,
    rounded,
    shadow,
    ...rest
  },
  ref
) {
  const style = {};

  if (display) {
    style.display = display;
  }
  if (position) {
    style.position = position;
  }
  if (overflow) {
    style.overflow = overflow;
  }
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }
  if (padding) {
    style.padding = typeof padding === 'number' ? `${padding}px` : padding;
  }
  if (margin) {
    style.margin = typeof margin === 'number' ? `${margin}px` : margin;
  }

  return (
    <Component
      ref={ref}
      className={[
        rounded ? `rounded-${rounded}` : '',
        shadow ? `shadow-${shadow}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={Object.keys(style).length > 0 ? style : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
});

Box.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  className: PropTypes.string,
  display: PropTypes.string,
  position: PropTypes.string,
  overflow: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded: PropTypes.string,
  shadow: PropTypes.string,
};

export default Box;