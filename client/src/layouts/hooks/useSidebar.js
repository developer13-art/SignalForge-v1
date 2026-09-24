/**
 * useSidebar
 *
 * Sidebar-specific helper: exposes the nav item list filtered by
 * role and returns the active item for a given path. Kept separate
 * from `useLayout` so the sidebar can be rendered in isolation
 * (storybook, tests) without the full layout context.
 *
 * @module client/src/layouts/hooks/useSidebar
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
} from 'lucide-react';

import { selectSidebarCollapsed, toggleSidebar } from '../../store/slices/ui.slice.js';
import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';

const USER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
  { to: '/signals/live', label: 'Signals', icon: Radio, roles: ['*'] },
  { to: '/trading', label: 'Trades', icon: ArrowLeftRight, roles: ['*'] },
  { to: '/trading/positions', label: 'Positions', icon: Layers, roles: ['*'] },
  { to: '/risk', label: 'Risk Management', icon: ShieldCheck, roles: ['*'] },
  { to: '/automation/rules', label: 'Automation', icon: Workflow, roles: ['*'] },
  { to: '/ai-intelligence', label: 'AI Intelligence', icon: Brain, roles: ['*'] },
  { to: '/brokers', label: 'Brokers', icon: Plug, roles: ['*'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['*'] },
  { to: '/marketplace/providers', label: 'Marketplace', icon: Store, roles: ['*'] },
  { to: '/marketplace/traders', label: 'Copy Trading', icon: Copy, roles: ['*'] },
  { to: '/wallet', label: 'Wallet', icon: Wallet, roles: ['*'] },
  { to: '/referrals', label: 'Referrals', icon: Users, roles: ['*'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['*'] },
  { to: '/settings/profile', label: 'Settings', icon: Settings, roles: ['*'] },
];

const PROVIDER_NAV = [
  { to: '/provider', label: 'Provider Dashboard', icon: LayoutDashboard, roles: ['PROVIDER'] },
  { to: '/provider/subscribers', label: 'Subscribers', icon: Users, roles: ['PROVIDER'] },
  { to: '/provider/revenue', label: 'Revenue', icon: BarChart3, roles: ['PROVIDER'] },
  { to: '/provider/certification', label: 'Certification', icon: ShieldCheck, roles: ['PROVIDER'] },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/kyc', label: 'KYC', icon: ShieldCheck, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/providers', label: 'Providers', icon: Store, roles: ['ADMIN', 'SUPER_ADMIN'] },
];

function filterByRole(items, roles) {
  return items.filter((item) => {
    if (item.roles.includes('*')) {
      return true;
    }
    return item.roles.some((role) => roles.includes(role));
  });
}

export default function useSidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const collapsed = useSelector(selectSidebarCollapsed);
  const currentUser = useSelector(selectCurrentUser);

  const roles = currentUser?.roles || [];

  const items = useMemo(() => {
    const userItems = filterByRole(USER_NAV, roles);
    const providerItems = filterByRole(PROVIDER_NAV, roles);
    const adminItems = filterByRole(ADMIN_NAV, roles);
    return [...userItems, ...providerItems, ...adminItems];
  }, [roles]);

  const activeItem = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.to.length - a.to.length);
    return sorted.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)) || null;
  }, [items, location.pathname]);

  return {
    collapsed,
    items,
    activeItem,
    toggle: () => dispatch(toggleSidebar()),
  };
}