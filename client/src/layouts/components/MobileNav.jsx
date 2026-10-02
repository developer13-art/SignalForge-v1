/**
 * MobileNav
 *
 * Slide-in drawer navigation for mobile viewports. Reuses the same
 * primary nav items as the desktop sidebar so the two never drift.
 *
 * @module client/src/layouts/components/MobileNav
 */

import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';

import { selectMobileNavOpen } from '../../store/slices/ui.slice.js';
import { setMobileNavOpen } from '../../store/slices/ui.slice.js';
import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';
import { cn } from '../../lib/utils/cn.util.js';
import { getNavForVariant } from './Sidebar.jsx';

export default function MobileNav({ variant = 'user' }) {
  const dispatch = useDispatch();
  const open = useSelector(selectMobileNavOpen);
  const currentUser = useSelector(selectCurrentUser);
  const closeButtonRef = useRef(null);
  const navigation = getNavForVariant(variant);
  const groups = navigation.kind === 'grouped'
    ? navigation.groups
    : [{ label: null, items: navigation.items }];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          dispatch(setMobileNavOpen(false));
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [dispatch, open]);

  const close = () => dispatch(setMobileNavOpen(false));

  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.username ||
    'Account';

  return (
    <>
      <div
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
      />
      <aside
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-surface-border bg-background-subtle transition-transform duration-200 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Mobile navigation"
        aria-hidden={!open}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            close();
          }
        }}
      >
        <div className="flex h-16 items-center justify-between border-b border-surface-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <span className="text-small font-bold text-white">SF</span>
            </div>
            <div className="leading-tight">
              <p className="text-small font-bold tracking-tight text-text-primary">SIGNALFORGE</p>
              <p className="text-caption font-medium text-primary-400">AI</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-5 px-2">
            {groups.map((group) => (
              <section key={group.label || 'primary-nav'} aria-label={group.label || undefined}>
                {group.label ? (
                  <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                    {group.label}
                  </h2>
                ) : null}
                <ul className="flex flex-col gap-1">
                  {group.items.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={close}
                        className={({ isActive }) =>
                          cn(
                            'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition-colors',
                            isActive
                              ? 'bg-primary-500/15 text-text-primary'
                              : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                          )
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1 truncate">{label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-surface-border p-4">
          <div className="flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle text-small font-semibold text-text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="truncate text-small font-semibold text-text-primary">{displayName}</p>
              <p className="truncate text-caption text-text-tertiary">
                {currentUser?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}