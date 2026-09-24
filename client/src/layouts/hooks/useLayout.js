/**
 * useLayout
 *
 * Provides the current layout's derived state: which layout is active
 * for the current route, whether the viewport is mobile, and helper
 * callbacks to open/close navigation. Centralizes the logic that the
 * layout components share.
 *
 * @module client/src/layouts/hooks/useLayout
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectSidebarCollapsed,
  setSidebarCollapsed,
  setMobileNavOpen,
  selectMobileNavOpen,
  setActivePath,
  setBreadcrumbs,
} from '../../store/slices/ui.slice.js';

const LAYOUT_BY_PREFIX = [
  { prefix: '/admin', layout: 'admin' },
  { prefix: '/compliance', layout: 'compliance' },
  { prefix: '/executive', layout: 'executive' },
  { prefix: '/support', layout: 'support' },
  { prefix: '/provider', layout: 'provider' },
  { prefix: '/dashboard', layout: 'user' },
  { prefix: '/signals', layout: 'user' },
  { prefix: '/trading', layout: 'user' },
  { prefix: '/risk', layout: 'user' },
  { prefix: '/automation', layout: 'user' },
  { prefix: '/brokers', layout: 'user' },
  { prefix: '/analytics', layout: 'user' },
  { prefix: '/marketplace', layout: 'user' },
  { prefix: '/wallet', layout: 'user' },
  { prefix: '/referrals', layout: 'user' },
  { prefix: '/subscriptions', layout: 'user' },
  { prefix: '/settings', layout: 'user' },
  { prefix: '/kyc', layout: 'user' },
  { prefix: '/notifications', layout: 'user' },
  { prefix: '/replay', layout: 'user' },
  { prefix: '/solana', layout: 'user' },
];

function resolveLayout(pathname) {
  const match = LAYOUT_BY_PREFIX.find((entry) => pathname.startsWith(entry.prefix));
  return match ? match.layout : 'public';
}

function useViewport() {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1440, isMobile: false, isTablet: false, isDesktop: true };
    }
    const width = window.innerWidth;
    return {
      width,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleResize = () => {
      const width = window.innerWidth;
      setViewport({
        width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

export default function useLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const viewport = useViewport();
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const mobileNavOpen = useSelector(selectMobileNavOpen);

  const layout = resolveLayout(location.pathname);

  useEffect(() => {
    dispatch(setActivePath(location.pathname));
  }, [dispatch, location.pathname]);

  useEffect(() => {
    if (viewport.isMobile && sidebarCollapsed) {
      dispatch(setSidebarCollapsed(false));
    }
  }, [dispatch, viewport.isMobile, sidebarCollapsed]);

  const collapseSidebar = () => dispatch(setSidebarCollapsed(true));
  const expandSidebar = () => dispatch(setSidebarCollapsed(false));
  const toggleSidebar = () => dispatch(setSidebarCollapsed(!sidebarCollapsed));
  const openMobileNav = () => dispatch(setMobileNavOpen(true));
  const closeMobileNav = () => dispatch(setMobileNavOpen(false));
  const setTrail = (items) => dispatch(setBreadcrumbs(items));

  return {
    layout,
    viewport,
    sidebarCollapsed,
    mobileNavOpen,
    collapseSidebar,
    expandSidebar,
    toggleSidebar,
    openMobileNav,
    closeMobileNav,
    setTrail,
  };
}