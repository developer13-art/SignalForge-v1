import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: {
    base: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    active: 'bg-slate-100 text-slate-900 font-semibold',
  },
  primary: {
    base: 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50',
    active: 'bg-indigo-50 text-indigo-700 font-semibold',
  },
  underline: {
    base: 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent',
    active: 'text-indigo-700 border-indigo-600 font-semibold',
  },
  pill: {
    base: 'text-slate-600 hover:text-slate-900 rounded-full',
    active: 'bg-slate-900 text-white font-semibold rounded-full',
  },
  sidebar: {
    base: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md',
    active: 'bg-indigo-50 text-indigo-700 font-semibold rounded-md',
  },
};

const SIZES = {
  sm: 'px-2 py-1 text-xs gap-1.5',
  md: 'px-3 py-2 text-sm gap-2',
  lg: 'px-4 py-2.5 text-base gap-2.5',
};

const NavLink = forwardRef(function NavLink(
  {
    href,
    active = false,
    variant = 'default',
    size = 'md',
    icon: Icon,
    badge,
    badgeVariant = 'default',
    disabled = false,
    external = false,
    children,
    onClick,
    className = '',
    LinkComponent = 'a',
    testId,
    ...rest
  },
  ref
) {
  const variantConfig = VARIANTS[variant] || VARIANTS.default;
  const sizeClass = SIZES[size] || SIZES.md;

  const badgeClasses = {
    default: 'bg-slate-200 text-slate-700',
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  };

  const handleKeyDown = (event) => {
    if (disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  };

  const isInteractive = !disabled;

  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <LinkComponent
      ref={ref}
      href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      {...linkProps}
      className={[
        'inline-flex items-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
        sizeClass,
        active ? variantConfig.active : variantConfig.base,
        disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {Icon ? (
        <Icon
          size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          aria-hidden="true"
          className="shrink-0"
        />
      ) : null}

      <span className="truncate">{children}</span>

      {badge !== undefined && badge !== null ? (
        <span
          className={[
            'ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            badgeClasses[badgeVariant] || badgeClasses.default,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {badge}
        </span>
      ) : null}
    </LinkComponent>
  );
});

NavLink.propTypes = {
  href: PropTypes.string,
  active: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'primary', 'underline', 'pill', 'sidebar']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badgeVariant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  LinkComponent: PropTypes.elementType,
  testId: PropTypes.string,
};

export default NavLink;
export { VARIANTS as NAV_LINK_VARIANTS, SIZES as NAV_LINK_SIZES };