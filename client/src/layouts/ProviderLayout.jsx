/**
 * Provider Layout
 *
 * Provider Business console shell. Wraps the standard user shell
 * with provider-specific navigation entries (revenue, subscribers,
 * certification, business tools).
 *
 * @module client/src/layouts/ProviderLayout
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import MobileNav from './components/MobileNav.jsx';

import {
  selectSidebarCollapsed,
  selectMobileNavOpen,
  setMobileNavOpen,
} from '../store/slices/ui.slice.js';

export default function ProviderLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const collapsed = useSelector(selectSidebarCollapsed);
  const mobileOpen = useSelector(selectMobileNavOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(setMobileNavOpen(false));
  }, [location.pathname, dispatch]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar variant="provider" collapsed={collapsed} />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'
        }`}
      >
        <Topbar />

        <main className={`flex-1 px-4 pb-12 pt-4 sm:px-6 lg:px-8 ${mounted ? 'animate-fade-in' : ''}`}>
          <Outlet />
        </main>
      </div>

      <MobileNav open={mobileOpen} variant="provider" onClose={() => dispatch(setMobileNavOpen(false))} />
    </div>
  );
}