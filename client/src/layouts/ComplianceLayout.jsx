/**
 * Compliance Layout
 *
 * Compliance / KYC Admin console shell. Sidebar is focused on KYC,
 * document types, verification providers, risk flags, and audit.
 *
 * @module client/src/layouts/ComplianceLayout
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

export default function ComplianceLayout() {
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
      <Sidebar variant="compliance" collapsed={collapsed} />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'
        }`}
      >
        <Topbar variant="compliance" />

        <main className={`flex-1 px-4 pb-12 pt-4 sm:px-6 lg:px-8 ${mounted ? 'animate-fade-in' : ''}`}>
          <Outlet />
        </main>
      </div>

      <MobileNav open={mobileOpen} variant="compliance" onClose={() => dispatch(setMobileNavOpen(false))} />
    </div>
  );
}