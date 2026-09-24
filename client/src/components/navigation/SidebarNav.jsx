import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, X } from 'lucide-react';

const WIDTHS = {
  sm: 'w-56',
  md: 'w-64',
  lg: 'w-72',
  xl: 'w-80',
};

const VARIANTS = {
  default: 'bg-white border-r border-slate-200',
  dark: 'bg-slate-900 text-white border-r border-slate-800',
  primary: 'bg-indigo-950 text-white border-r border-indigo-900',
  light: 'bg-slate-50 border-r border-slate-200',
};

const SidebarNav = forwardRef(function SidebarNav(
  {
    children,
    header,
    footer,
    variant = 'default',
    width = 'md',
    collapsed = false,
    onCollapseToggle,
    collapsible = false,
    mobileOpen = false,
    onMobileClose,
    mobileBreakpoint = 'lg',
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    testId,
    ...rest
  },
  ref
) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;
  const widthClass = collapsed ? 'w-16' : WIDTHS[width] || WIDTHS.md;

  const isDark = variant === 'dark' || variant === 'primary';
  const toggleIconColor = isDark ? 'text-white/70 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100';

  return (
    <>
      {mobileOpen ? (
        <div
          className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm ${mobileBreakpoint}:hidden`}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        ref={ref}
        className={[
          'flex flex-col transition-all duration-200 ease-out',
          variantClass,
          widthClass,
          'h-screen',
          'hidden',
          `${mobileBreakpoint}:flex`,
          mobileOpen
            ? `fixed inset-y-0 left-0 z-50 flex ${mobileBreakpoint}:static ${mobileBreakpoint}:z-auto`
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        {header ? (
          <div
            className={[
              'flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4',
              isDark ? 'border-white/10' : 'border-slate-200',
              headerClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="min-w-0 flex-1">
              {collapsed ? null : header}
            </div>

            {onMobileClose ? (
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close sidebar"
                className={`rounded-md p-1.5 ${toggleIconColor} ${mobileBreakpoint}:hidden`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}

        <nav
          className={['flex-1 overflow-y-auto px-3 py-4', bodyClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </nav>

        {footer ? (
          <div
            className={[
              'shrink-0 border-t px-3 py-3',
              isDark ? 'border-white/10' : 'border-slate-200',
              footerClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {footer}
          </div>
        ) : null}

        {collapsible && onCollapseToggle ? (
          <button
            type="button"
            onClick={onCollapseToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={[
              'hidden shrink-0 items-center justify-center border-t py-2 transition-colors',
              isDark ? 'border-white/10' : 'border-slate-200',
              toggleIconColor,
              `${mobileBreakpoint}:flex`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <ChevronLeft
              size={16}
              className={collapsed ? 'rotate-180' : ''}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </aside>
    </>
  );
});

SidebarNav.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'dark', 'primary', 'light']),
  width: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  collapsed: PropTypes.bool,
  onCollapseToggle: PropTypes.func,
  collapsible: PropTypes.bool,
  mobileOpen: PropTypes.bool,
  onMobileClose: PropTypes.func,
  mobileBreakpoint: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default SidebarNav;
export { VARIANTS as SIDEBAR_NAV_VARIANTS, WIDTHS as SIDEBAR_NAV_WIDTHS };