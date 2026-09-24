/**
 * Topbar
 *
 * Fixed top bar shared by every authenticated shell and the public
 * marketing site. The variant determines which controls are visible
 * (public vs. authenticated vs. admin).
 *
 * @module client/src/layouts/components/Topbar
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Wallet,
  Command,
  PlayCircle,
} from 'lucide-react';
import clsx from 'clsx';

import logo from '@assets/icons/svg/logo.svg';
import { routes } from '@config/routes.config.js';
import { useSidebar } from '../hooks/useSidebar.js';
import { useTheme } from '@context/ThemeContext.jsx';
import EnvironmentBadge from './EnvironmentBadge.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';
import UserMenu from './UserMenu.jsx';
import SolanaWalletMenu from './SolanaWalletMenu.jsx';

export default function Topbar({ variant = 'user' }) {
  const { toggleCollapsed, openMobile } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isPublic = variant === 'public';
  const isAuthenticated = ['user', 'provider', 'admin', 'compliance', 'executive', 'support'].includes(variant);

  if (isPublic) {
    return <PublicTopbar variant={variant} />;
  }

  return (
    <header className="sticky top-0 z-30 h-[68px] w-full border-b border-surface-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={openMobile}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary transition hover:text-text-primary lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary transition hover:text-text-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden lg:flex items-center gap-3 ml-2">
          <EnvironmentBadge />
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1.5 text-caption text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-success shadow-glow-success" />
            Live Trading
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end lg:justify-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-full max-w-md items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-small text-text-tertiary transition hover:border-primary-500 hover:text-text-secondary"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search anything...</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-surface-border bg-background px-1.5 py-0.5 text-caption">
              <Command className="h-3 w-3" /> K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsMenu />
          <a
            href="https://docs.signalforge.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary transition hover:text-text-primary"
            aria-label="Help center"
          >
            <HelpCircle className="h-4 w-4" />
          </a>
          {isAuthenticated ? <SolanaWalletMenu /> : null}
          {isAuthenticated ? <UserMenu variant={variant} /> : null}
        </div>
      </div>

      {searchOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-2xl rounded-2xl border border-surface-border bg-surface shadow-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-surface-border px-4 py-3">
              <Search className="h-4 w-4 text-text-tertiary" />
              <input
                autoFocus
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search signals, trades, providers, wallets..."
                className="flex-1 bg-transparent text-small text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              <kbd className="rounded-md border border-surface-border bg-background px-1.5 py-0.5 text-caption text-text-tertiary">
                ESC
              </kbd>
            </div>
            <div className="p-6 text-center text-small text-text-tertiary">
              Start typing to search across the platform.
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function PublicTopbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-[68px] w-full border-b border-surface-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to={routes.public.home} className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="SignalForge" className="h-9 w-9" />
          <div className="hidden sm:block leading-tight">
            <p className="text-small font-semibold">SignalForge</p>
            <p className="text-caption text-text-tertiary">Intelligence · Execution · Results</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <PublicNavItem label="Features" to={routes.public.features} hasDropdown />
          <PublicNavItem label="How It Works" to={routes.public.howItWorks} />
          <PublicNavItem label="Marketplace" to={routes.user.providerMarketplace.browse} hasDropdown />
          <PublicNavItem label="Pricing" to={routes.public.pricing} />
          <PublicNavItem label="Resources" to={routes.public.apiPlatform} hasDropdown />
          <PublicNavItem label="Company" to={routes.public.about} hasDropdown />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary transition hover:text-text-primary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to={routes.auth.login}
            className="hidden sm:inline-flex items-center rounded-lg border border-surface-border px-4 py-2 text-small font-medium text-text-secondary transition hover:text-text-primary"
          >
            Login
          </Link>
          <Link
            to={routes.auth.register}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-small font-semibold text-white shadow-glow-primary transition hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicNavItem({ label, to, hasDropdown }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-small font-medium text-text-secondary transition hover:text-text-primary"
    >
      {label}
      {hasDropdown ? <ChevronDown className="h-3.5 w-3.5" /> : null}
    </Link>
  );
}