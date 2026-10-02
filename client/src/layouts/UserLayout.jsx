/**
 * User Layout
 *
 * Main authenticated application shell. Composes the Sidebar, Topbar,
 * optional KYC banner, and a scrollable main region. The sidebar is
 * fixed on desktop and slides in as a drawer on mobile; the content
 * column uses a left padding equal to the sidebar width so the two
 * never overlap.
 *
 * @module client/src/layouts/UserLayout
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import MobileNav from './components/MobileNav.jsx';
import KycBanner from './components/KycBanner.jsx';

import {
  selectSidebarCollapsed,
  selectMobileNavOpen,
  setMobileNavOpen,
} from '../store/slices/ui.slice.js';

export default function UserLayout() {
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
      <Sidebar variant="user" collapsed={collapsed} />

      {/*
       * Content column. The left padding reserves exactly the width of
       * the fixed sidebar. It transitions with the sidebar's collapse
       * state so the two stay aligned.
       */}
      <div
        className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'
        }`}
      >
        <Topbar />

        <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className={mounted ? 'animate-fade-in' : ''}>
            <KycBanner />
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav
        open={mobileOpen}
        variant="user"
        onClose={() => dispatch(setMobileNavOpen(false))}
      />
    </div>
  );
}