import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: 'text-indigo-600 hover:text-indigo-800 hover:underline',
  subtle: 'text-slate-600 hover:text-slate-900 hover:underline',
  strong: 'text-slate-900 hover:text-indigo-600 hover:underline',
  danger: 'text-rose-600 hover:text-rose-800 hover:underline',
  white: 'text-white hover:text-white/80 hover:underline',
  plain: 'text-inherit hover:opacity-80',
};

const Link = forwardRef(function Link(
  {
    children,
    href,
    variant = 'default',
    external = false,
    underline = false,
    as: Component = 'a',
    className = '',
    ...rest
  },
  ref
) {
  const isExternal = external || (href && /^(https?:|mailto:|tel:)/.test(href));

  const props = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer', ...rest }
    : rest;

  return (
    <Component
      ref={ref}
      href={href}
      className={[
        'inline-flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded',
        VARIANTS[variant] || VARIANTS.default,
        underline ? 'underline' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  );
});

Link.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'subtle', 'strong', 'danger', 'white', 'plain']),
  external: PropTypes.bool,
  underline: PropTypes.bool,
  as: PropTypes.elementType,
  className: PropTypes.string,
};

export default Link;