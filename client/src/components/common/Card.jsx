/**
 * Card
 *
 * Container component used throughout the platform. All colours are
 * expressed as design tokens so that the card follows the active
 * theme. The `className` prop is appended last so that callers can
 * always override backgrounds, borders, and shadows when a specific
 * page needs a different tone.
 *
 * @module client/src/components/common/Card
 */

import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: 'bg-surface border border-surface-border',
  elevated: 'bg-surface border border-surface-border shadow-elevated',
  outlined: 'bg-surface border-2 border-surface-border',
  ghost: 'bg-transparent border-0',
  filled: 'bg-surface-elevated border border-surface-border',
  subtle: 'bg-surface-elevated border border-surface-border/60',
  dark: 'bg-surface-elevated border border-surface-border text-text-primary',
  light: 'bg-white border border-slate-200 text-slate-900',
};

const PADDINGS = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const RADII = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    padding = 'md',
    radius = 'lg',
    hoverable = false,
    clickable = false,
    onClick,
    className = '',
    header,
    headerClassName = '',
    footer,
    footerClassName = '',
    bodyClassName = '',
    as: Component = 'div',
    testId,
    ...rest
  },
  ref,
) {
  const isInteractive = clickable || Boolean(onClick);

  const containerClassName = useMemo(() => {
    return [
      'flex flex-col overflow-hidden transition-all duration-200',
      VARIANTS[variant] || VARIANTS.default,
      RADII[radius] || RADII.lg,
      hoverable ? 'hover:shadow-lg hover:-translate-y-0.5' : '',
      isInteractive
        ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
  }, [variant, radius, hoverable, isInteractive, className]);

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event) => {
    if (!isInteractive) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  const paddingClass = PADDINGS[padding] || PADDINGS.md;

  const hasHeader = Boolean(header);
  const hasFooter = Boolean(footer);

  return (
    <Component
      ref={ref}
      className={containerClassName}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      data-testid={testId}
      {...rest}
    >
      {hasHeader ? (
        <div
          className={[
            'flex items-center justify-between gap-3 border-b border-surface-border',
            padding === 'none' ? 'px-4 py-3' : '',
            headerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {header}
        </div>
      ) : null}

      <div
        className={[paddingClass, hasHeader || hasFooter ? 'flex-1' : '', bodyClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>

      {hasFooter ? (
        <div
          className={[
            'flex items-center justify-between gap-3 border-t border-surface-border',
            padding === 'none' ? 'px-4 py-3' : '',
            footerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {footer}
        </div>
      ) : null}
    </Component>
  );
});

Card.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'ghost', 'filled', 'subtle', 'dark', 'light']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  radius: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl']),
  hoverable: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  header: PropTypes.node,
  headerClassName: PropTypes.string,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  as: PropTypes.elementType,
  testId: PropTypes.string,
};

export default Card;
export { VARIANTS as CARD_VARIANTS, PADDINGS as CARD_PADDINGS };