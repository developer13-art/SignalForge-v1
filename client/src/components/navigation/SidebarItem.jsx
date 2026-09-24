import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: {
    base: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    active: 'bg-indigo-50 text-indigo-700 font-semibold',
    icon: 'text-slate-400',
    iconActive: 'text-indigo-600',
  },
  dark: {
    base: 'text-slate-300 hover:bg-white/10 hover:text-white',
    active: 'bg-white/15 text-white font-semibold',
    icon: 'text-slate-400',
    iconActive: 'text-white',
  },
  primary: {
    base: 'text-indigo-100 hover:bg-white/10 hover:text-white',
    active: 'bg-white/20 text-white font-semibold',
    icon: 'text-indigo-200/80',
    iconActive: 'text-white',
  },
};

const SIZES = {
  sm: 'px-2 py-1.5 text-xs gap-2 rounded',
  md: 'px-3 py-2 text-sm gap-2.5 rounded-md',
  lg: 'px-3 py-2.5 text-base gap-3 rounded-md',
};

const SidebarItem = forwardRef(function SidebarItem(
  {
    href,
    active = false,
    variant = 'default',
    size = 'md',
    icon: Icon,
    badge,
    badgeVariant = 'default',
    disabled = false,
    collapsed = false,
    onClick,
    children,
    LinkComponent = 'a',
    className = '',
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
    dark: 'bg-white/15 text-white',
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

  const resolvedBadgeClass =
    variant === 'dark' || variant === 'primary'
      ? badgeClasses.dark
      : badgeClasses[badgeVariant] || badgeClasses.default;

  return (
    <LinkComponent
      ref={ref}
      href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick}
      onKeyDown={!disabled ? handleKeyDown : undefined}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      title={collapsed && typeof children === 'string' ? children : undefined}
      tabIndex={disabled ? -1 : undefined}
      className={[
        'flex w-full items-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        sizeClass,
        active ? variantConfig.active : variantConfig.base,
        disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer',
        collapsed ? 'justify-center' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {Icon ? (
        <Icon
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18}
          className={[
            'shrink-0',
            active ? variantConfig.iconActive : variantConfig.icon,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      ) : null}

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{children}</span>
          {badge !== undefined && badge !== null ? (
            <span
              className={[
                'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                resolvedBadgeClass,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {badge}
            </span>
          ) : null}
        </>
      ) : null}
    </LinkComponent>
  );
});

SidebarItem.propTypes = {
  href: PropTypes.string,
  active: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'dark', 'primary']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badgeVariant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
  disabled: PropTypes.bool,
  collapsed: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  LinkComponent: PropTypes.elementType,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SidebarItem;
export { VARIANTS as SIDEBAR_ITEM_VARIANTS, SIZES as SIDEBAR_ITEM_SIZES };