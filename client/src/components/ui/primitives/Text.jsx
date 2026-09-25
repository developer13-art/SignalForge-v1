import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

const WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const COLORS = {
  default: 'text-slate-700',
  muted: 'text-slate-500',
  subtle: 'text-slate-400',
  strong: 'text-slate-900',
  primary: 'text-indigo-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
  white: 'text-white',
  inherit: '',
};

const ALIGNS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const Text = forwardRef(function Text(
  {
    children,
    as: Component = 'p',
    size = 'base',
    weight = 'normal',
    color = 'default',
    align = 'left',
    truncate = false,
    clamp,
    italic = false,
    underline = false,
    uppercase = false,
    leading,
    tracking,
    className = '',
    ...rest
  },
  ref
) {
  const style = {};

  if (clamp && typeof clamp === 'number') {
    style.display = '-webkit-box';
    style.WebkitLineClamp = clamp;
    style.WebkitBoxOrient = 'vertical';
    style.overflow = 'hidden';
  }

  return (
    <Component
      ref={ref}
      className={[
        SIZES[size] || SIZES.base,
        WEIGHTS[weight] || WEIGHTS.normal,
        COLORS[color] || COLORS.default,
        ALIGNS[align] || ALIGNS.left,
        truncate ? 'truncate' : '',
        italic ? 'italic' : '',
        underline ? 'underline' : '',
        uppercase ? 'uppercase tracking-wide' : '',
        leading ? `leading-${leading}` : '',
        tracking ? `tracking-${tracking}` : '',
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

Text.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl']),
  weight: PropTypes.oneOf(['normal', 'medium', 'semibold', 'bold']),
  color: PropTypes.oneOf([
    'default',
    'muted',
    'subtle',
    'strong',
    'primary',
    'success',
    'warning',
    'danger',
    'white',
    'inherit',
  ]),
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  truncate: PropTypes.bool,
  clamp: PropTypes.number,
  italic: PropTypes.bool,
  underline: PropTypes.bool,
  uppercase: PropTypes.bool,
  leading: PropTypes.string,
  tracking: PropTypes.string,
  className: PropTypes.string,
};

export default Text;