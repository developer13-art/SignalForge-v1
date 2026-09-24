/**
 * Sidebar
 *
 * Primary navigation rail for the authenticated shell. Collapses to a
 * narrow icon rail on smaller desktop widths and becomes a slide-in
 * drawer on mobile. Matches the deep navy surface, subtle border, and
 * purple-blue accent treatment from the design system.
 *
 * @module client/src/layouts/components/Sidebar
 */

import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Radio,
  ArrowLeftRight,
  Layers,
  ShieldCheck,
  Workflow,
  Brain,
  Plug,
  BarChart3,
  Store,
  Copy,
  Wallet,
  Users,
  Bell,
  Settings,
  ChevronRight,
  Zap,
} from 'lucide-react';

import { selectSidebarCollapsed } from '../../store/slices/ui.slice.js';
import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';
import { selectUnreadCount } from '../../store/slices/notification.slice.js';
import { cn } from '../../lib/utils/cn.util.js';

const PRIMARY_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/signals/live', label: 'Signals', icon: Radio, badgeKey: 'signals' },
  { to: '/trading', label: 'Trades', icon: ArrowLeftRight },
  { to: '/trading/positions', label: 'Positions', icon: Layers },
  { to: '/risk', label: 'Risk Management', icon: ShieldCheck },
  { to: '/automation/rules', label: 'Automation', icon: Workflow },
  { to: '/ai-intelligence', label: 'AI Intelligence', icon: Brain },
  { to: '/brokers', label: 'Brokers', icon: Plug, badgeKey: 'brokers' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/marketplace/providers', label: 'Marketplace', icon: Store },
  { to: '/marketplace/traders', label: 'Copy Trading', icon: Copy },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/referrals', label: 'Referrals', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell, badgeKey: 'unread' },
  { to: '/settings/profile', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const collapsed = useSelector(selectSidebarCollapsed);
  const currentUser = useSelector(selectCurrentUser);
  const unreadCount = useSelector(selectUnreadCount);
  const location = useLocation();

  const subscriptionLabel = currentUser?.subscription?.planName || 'Free Plan';
  const subscriptionRenews = currentUser?.subscription?.renewsInDays;
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.username ||
    'SignalForge User';
  const kycStatus = currentUser?.kycStatus || 'NOT_STARTED';
  const isVerified = kycStatus === 'VERIFIED';

  const badgeValueFor = (key) => {
    if (key === 'unread') {
      return unreadCount > 0 ? unreadCount : null;
    }
    if (key === 'signals') {
      return currentUser?.activeSignalCount || null;
    }
    if (key === 'brokers') {
      return currentUser?.connectedBrokerCount || null;
    }
    return null;
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-surface-border bg-background-subtle transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[260px]',
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-surface-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-primary">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          {!collapsed ? (
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-text-primary">
                SIGNALFORGE
              </span>
              <span className="text-caption font-medium text-primary-400">AI</span>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3" role="navigation">
        <ul className="flex flex-col gap-1 px-2">
          {PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = item.badgeKey ? badgeValueFor(item.badgeKey) : null;
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex h-10 items-center gap-3 rounded-lg px-3 text-small font-medium transition-colors',
                    collapsed ? 'justify-center px-0' : 'justify-start',
                    isActive
                      ? 'bg-primary-500/15 text-text-primary shadow-[inset_0_0_0_1px_rgba(99,102,241,0.35)]'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                      isActive ? 'text-primary-400' : 'text-text-tertiary group-hover:text-text-secondary',
                    )}
                    strokeWidth={2}
                  />
                  {!collapsed ? (
                    <span className="flex-1 truncate">{item.label}</span>
                  ) : null}
                  {!collapsed && badge ? (
                    <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-primary-500/20 px-1.5 py-0.5 text-caption font-semibold text-primary-300">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed ? (
        <div className="mx-3 mb-3 rounded-xl border border-surface-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-caption font-semibold uppercase tracking-wider text-primary-300">
                  Pro Plan
                </p>
                <p className="text-caption text-text-tertiary">
                  {subscriptionRenews
                    ? `Renews in ${subscriptionRenews} days`
                    : 'Active subscription'}
                </p>
              </div>
            </div>
          </div>
          <NavLink
            to="/subscriptions/my"
            className="mt-3 flex h-8 w-full items-center justify-center rounded-md border border-surface-border bg-surface-subtle text-caption font-medium text-text-secondary transition-colors hover:border-primary-500/50 hover:text-text-primary"
          >
            Manage Plan
          </NavLink>
        </div>
      ) : null}

      <div
        className={cn(
          'border-t border-surface-border p-3',
          collapsed ? 'flex justify-center' : 'flex items-center gap-3',
        )}
      >
        <div className="relative flex-shrink-0">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={displayName}
              className="h-10 w-10 rounded-full border border-surface-border object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-subtle text-small font-semibold text-text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background-subtle',
              isVerified ? 'bg-success' : 'bg-warning',
            )}
            aria-hidden="true"
          />
        </div>
        {!collapsed ? (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-small font-semibold text-text-primary">
              {displayName}
            </p>
            <p className="truncate text-caption text-text-tertiary">
              {isVerified ? 'Verified' : 'Unverified'}
            </p>
          </div>
        ) : null}
        {!collapsed ? (
          <NavLink
            to="/settings/profile"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            aria-label="Open user menu"
          >
            <ChevronRight className="h-4 w-4" />
          </NavLink>
        ) : null}
      </div>

      <div className="sr-only">SignalForge {subscriptionLabel}</div>
    </aside>
  );
}