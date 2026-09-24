/**
 * MobileNav
 *
 * Slide-in drawer navigation for mobile viewports. Reuses the same
 * primary nav items as the desktop sidebar so the two never drift.
 *
 * @module client/src/layouts/components/MobileNav
 */

import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, LayoutDashboard, Radio, ArrowLeftRight, Layers, ShieldCheck, Workflow, Brain, Plug, BarChart3, Store, Copy, Wallet, Users, Bell, Settings } from 'lucide-react';

import { selectMobileNavOpen } from '../../store/slices/ui.slice.js';
import { setMobileNavOpen } from '../../store/slices/ui.slice.js';
import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';
import { cn } from '../../lib/utils/cn.util.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/signals/live', label: 'Signals', icon: Radio },
  { to: '/trading', label: 'Trades', icon: ArrowLeftRight },
  { to: '/trading/positions', label: 'Positions', icon: Layers },
  { to: '/risk', label: 'Risk Management', icon: ShieldCheck },
  { to: '/automation/rules', label: 'Automation', icon: Workflow },
  { to: '/ai-intelligence', label: 'AI Intelligence', icon: Brain },
  { to: '/brokers', label: 'Brokers', icon: Plug },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/marketplace/providers', label: 'Marketplace', icon: Store },
  { to: '/marketplace/traders', label: 'Copy Trading', icon: Copy },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/referrals', label: 'Referrals', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/profile', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const dispatch = useDispatch();
  const open = useSelector(selectMobileNavOpen);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-surface-border bg-background-subtle transition-transform duration-200 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Mobile navigation"
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
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="flex flex-col gap-1 px-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={close}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-3 rounded-lg px-3 text-small font-medium transition-colors',
                      isActive
                        ? 'bg-primary-500/15 text-text-primary'
                        : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
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