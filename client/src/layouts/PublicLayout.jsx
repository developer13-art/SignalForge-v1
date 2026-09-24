/**
 * Public Layout
 *
 * Marketing site shell: sticky top navigation, main content, and
 * footer. Used by every public marketing route. Fully responsive
 * with a mobile drawer for primary navigation.
 *
 * @module client/src/layouts/PublicLayout
 */

import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

import Footer from './components/Footer.jsx';

const PRIMARY_NAV = [
  { label: 'Features', href: '/features', children: [
    { label: 'Overview', href: '/features' },
    { label: 'AI Signal Intelligence', href: '/features/ai' },
    { label: 'Automated Trading', href: '/features/automated-trading' },
    { label: 'Risk Management', href: '/features/risk' },
    { label: 'Copy Trading', href: '/features/copy-trading' },
    { label: 'Analytics', href: '/features/analytics' },
    { label: 'Marketplace', href: '/features/marketplace' },
  ] },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Providers', href: '/marketplace/providers' },
  { label: 'Marketplace', href: '/marketplace/providers', children: [
    { label: 'Providers', href: '/marketplace/providers' },
    { label: 'Traders', href: '/marketplace/traders' },
  ] },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/faq', children: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Security', href: '/security' },
    { label: 'API Platform', href: '/api-platform' },
  ] },
  { label: 'Company', href: '/about', children: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ] },
];

export default function PublicLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <header
        className={`sticky top-0 z-sticky transition-all duration-200 ${
          scrolled
            ? 'bg-background/85 backdrop-blur-xl border-b border-surface-border'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/assets/logo.svg" alt="SignalForge" className="h-8 w-8" />
            <span className="text-h5 font-bold tracking-tight">
              SignalForge<span className="text-primary-400"> AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {PRIMARY_NAV.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => item.children && setOpenDropdown(null)}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1 rounded-lg px-3 py-2 text-small font-medium transition ${
                      isActive
                        ? 'text-text-primary bg-surface-hover'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`
                  }
                >
                  {item.label}
                  {item.children ? <ChevronDown className="h-3.5 w-3.5" /> : null}
                </NavLink>

                {item.children && openDropdown === item.label ? (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="min-w-[220px] rounded-xl border border-surface-border bg-surface shadow-modal p-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block rounded-lg px-3 py-2 text-small text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-small font-medium text-text-secondary transition hover:text-text-primary"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-small font-semibold text-white shadow-glow transition hover:shadow-glow-primary"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="lg:hidden border-t border-surface-border bg-background-subtle">
            <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              {PRIMARY_NAV.map((item) => (
                <div key={item.label} className="border-b border-surface-border last:border-0">
                  <Link
                    to={item.href}
                    className="flex items-center justify-between py-3 text-small font-medium text-text-primary"
                  >
                    {item.label}
                    {item.children ? <ChevronDown className="h-4 w-4" /> : null}
                  </Link>
                  {item.children ? (
                    <div className="pb-3 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block py-2 text-small text-text-secondary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-center text-small font-medium text-text-secondary"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="w-full rounded-lg bg-gradient-primary px-4 py-2.5 text-center text-small font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}