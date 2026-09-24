/**
 * Topbar
 *
 * Application top bar for the authenticated shell. Contains the mobile
 * menu toggle, environment badge, global search, notifications,
 * help, and user menu. Matches the mockups: translucent dark surface
 * with subtle border and rounded search input.
 *
 * @module client/src/layouts/components/Topbar
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Search, Bell, HelpCircle, Command } from 'lucide-react';

import {
  toggleMobileNav,
  toggleSidebar,
  setCommandPaletteOpen,
} from '../../store/slices/ui.slice.js';
import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';
import { selectUnreadCount } from '../../store/slices/notification.slice.js';
import { cn } from '../../lib/utils/cn.util.js';

import EnvironmentBadge from './EnvironmentBadge.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';
import UserMenu from './UserMenu.jsx';
import SolanaWalletMenu from './SolanaWalletMenu.jsx';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const unreadCount = useSelector(selectUnreadCount);

  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeydown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dispatch(setCommandPaletteOpen(true));
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [dispatch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!search.trim()) {
      return;
    }
    navigate(`/signals?query=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.username ||
    'Account';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-surface-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button
        type="button"
        onClick={() => dispatch(toggleMobileNav())}
        className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        className="hidden h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary lg:flex"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:block">
        <EnvironmentBadge />
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="ml-auto hidden max-w-xl flex-1 items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-2 text-small text-text-secondary focus-within:border-primary-500/50 md:flex"
        role="search"
      >
        <Search className="h-4 w-4 text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search anything..."
          className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
          aria-label="Search"
        />
        <span className="hidden items-center gap-1 rounded border border-surface-border px-1.5 py-0.5 text-caption text-text-tertiary lg:inline-flex">
          <Command className="h-3 w-3" />K
        </span>
      </form>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          aria-label="Notifications"
          onMouseEnter={() => setNotificationsOpen(true)}
          onMouseLeave={() => setNotificationsOpen(false)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
          <NotificationsMenu
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </button>

        <button
          type="button"
          onClick={() => navigate('/support')}
          className="hidden h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary sm:flex"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div
          className="relative"
          onMouseEnter={() => setWalletMenuOpen(true)}
          onMouseLeave={() => setWalletMenuOpen(false)}
        >
          <SolanaWalletMenu
            open={walletMenuOpen}
            onClose={() => setWalletMenuOpen(false)}
          />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setUserMenuOpen(true)}
          onMouseLeave={() => setUserMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-2 py-1.5 text-small font-medium text-text-secondary transition-colors hover:border-primary-500/40 hover:text-text-primary',
            )}
            aria-label="Open user menu"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={displayName}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-subtle text-caption font-semibold text-text-primary">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden truncate sm:inline">{displayName}</span>
          </button>
          <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
}