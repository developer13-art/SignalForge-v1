import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, X } from 'lucide-react';

const VARIANTS = {
  default: 'bg-white border-b border-slate-200',
  transparent: 'bg-transparent',
  dark: 'bg-slate-900 text-white border-b border-slate-800',
  primary: 'bg-indigo-600 text-white',
  floating: 'bg-white/80 backdrop-blur-md rounded-full shadow-lg mx-4 my-2',
};

const POSITIONS = {
  static: '',
  sticky: 'sticky top-0 z-30',
  fixed: 'fixed top-0 left-0 right-0 z-30',
};

const Navbar = forwardRef(function Navbar(
  {
    variant = 'default',
    position = 'sticky',
    brand,
    brandHref = '/',
    onBrandClick,
    navLinks,
    renderNavLinks,
    actions,
    mobileMenu,
    mobileMenuId = 'navbar-mobile-menu',
    size = 'md',
    fullWidth = false,
    className = '',
    containerClassName = '',
    testId,
    ...rest
  },
  ref
) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const variantClass = VARIANTS[variant] || VARIANTS.default;
  const positionClass = POSITIONS[position] || '';

  const sizeClass =
    size === 'sm' ? 'h-12' : size === 'lg' ? 'h-20' : 'h-16';

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleBrandKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onBrandClick) {
        onBrandClick(event);
      }
    }
  };

  const BrandComponent = brandHref ? 'a' : 'div';

  const linksContent = useMemo(() => {
    if (renderNavLinks) {
      return renderNavLinks({ closeMobile: () => setMobileOpen(false) });
    }
    if (!navLinks || navLinks.length === 0) {
      return null;
    }
    return (
      <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
        {navLinks.map((link, index) => (
          <li key={link.href || link.label || index}>
            <a
              href={link.href}
              onClick={(event) => {
                if (link.onClick) {
                  link.onClick(event);
                }
                setMobileOpen(false);
              }}
              className={[
                'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                variant === 'dark' || variant === 'primary'
                  ? 'text-white/80 hover:bg-white/10 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                link.active
                  ? variant === 'dark' || variant === 'primary'
                    ? 'bg-white/15 text-white'
                    : 'bg-slate-100 text-slate-900'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }, [navLinks, renderNavLinks, variant]);

  return (
    <nav
      ref={ref}
      className={[
        'w-full',
        variantClass,
        positionClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div
        className={[
          'flex items-center justify-between gap-4',
          sizeClass,
          fullWidth ? 'px-4' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          containerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {brand ? (
          <BrandComponent
            href={brandHref}
            onClick={onBrandClick}
            onKeyDown={onBrandClick ? handleBrandKeyDown : undefined}
            tabIndex={onBrandClick ? 0 : undefined}
            role={onBrandClick ? 'button' : undefined}
            className="flex shrink-0 items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
          >
            {typeof brand === 'function' ? brand() : brand}
          </BrandComponent>
        ) : null}

        <div className="hidden flex-1 items-center md:flex">{linksContent}</div>

        <div className="hidden items-center gap-2 md:flex">
          {actions}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls={mobileMenuId}
          className={[
            'inline-flex items-center justify-center rounded-md p-2 md:hidden transition-colors',
            variant === 'dark' || variant === 'primary'
              ? 'text-white hover:bg-white/10'
              : 'text-slate-600 hover:bg-slate-100',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id={mobileMenuId}
          className={[
            'md:hidden border-t',
            variant === 'dark' || variant === 'primary'
              ? 'border-white/10 bg-slate-900'
              : 'border-slate-200 bg-white',
            'px-4 py-4',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {linksContent}
          {actions ? <div className="mt-4 flex flex-col gap-2">{actions}</div> : null}
          {mobileMenu ? <div className="mt-4">{mobileMenu}</div> : null}
        </div>
      ) : null}
    </nav>
  );
});

Navbar.propTypes = {
  variant: PropTypes.oneOf(['default', 'transparent', 'dark', 'primary', 'floating']),
  position: PropTypes.oneOf(['static', 'sticky', 'fixed']),
  brand: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  brandHref: PropTypes.string,
  onBrandClick: PropTypes.func,
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      label: PropTypes.node,
      active: PropTypes.bool,
      onClick: PropTypes.func,
    })
  ),
  renderNavLinks: PropTypes.func,
  actions: PropTypes.node,
  mobileMenu: PropTypes.node,
  mobileMenuId: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Navbar;
export { VARIANTS as NAVBAR_VARIANTS, POSITIONS as NAVBAR_POSITIONS };