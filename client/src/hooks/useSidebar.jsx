/**
 * SignalForge - useSidebar Hook
 *
 * Manages the open, collapsed, and mobile states of the application
 * sidebar. The state lives in a context provider so that Topbar,
 * Sidebar, and MobileNav all read the same values.
 *
 * Consumers:
 *   const { isOpen, toggle, isCollapsed, toggleCollapse, isMobileOpen, toggleMobile } = useSidebar();
 *
 * The provider must be mounted above every consumer. In SignalForge
 * this is done once inside the UserLayout, ProviderLayout, and
 * AdminLayout. If the provider is not mounted, the hook falls back
 * to a safe default that never throws so that unauthenticated pages
 * do not crash.
 *
 * @module client/src/layouts/hooks/useSidebar
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SidebarContext = createContext(null);

const STORAGE_KEY = 'signalforge.sidebar.collapsed';

const DEFAULT_STATE = Object.freeze({
  isOpen: true,
  isCollapsed: false,
  isMobileOpen: false,
});

function readStoredCollapsed() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_STATE.isCollapsed;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'true') {
      return true;
    }
    if (raw === 'false') {
      return false;
    }
  } catch (_error) {
    // Ignore storage access errors.
  }
  return DEFAULT_STATE.isCollapsed;
}

function writeStoredCollapsed(value) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch (_error) {
    // Ignore storage access errors.
  }
}

export function SidebarProvider({ children, defaultOpen = true, defaultCollapsed }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCollapsed, setIsCollapsed] = useState(
    defaultCollapsed !== undefined ? defaultCollapsed : readStoredCollapsed(),
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    writeStoredCollapsed(isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleChange = (event) => {
      if (event.matches) {
        setIsMobileOpen(false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((current) => !current);
  }, []);

  const openMobile = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((current) => !current);
  }, []);

  const closeAll = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      isCollapsed,
      isMobileOpen,
      open,
      close,
      toggle,
      collapse,
      expand,
      toggleCollapse,
      openMobile,
      closeMobile,
      toggleMobile,
      closeAll,
    }),
    [
      isOpen,
      isCollapsed,
      isMobileOpen,
      open,
      close,
      toggle,
      collapse,
      expand,
      toggleCollapse,
      openMobile,
      closeMobile,
      toggleMobile,
      closeAll,
    ],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

const FALLBACK_STATE = Object.freeze({
  isOpen: false,
  isCollapsed: false,
  isMobileOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  collapse: () => {},
  expand: () => {},
  toggleCollapse: () => {},
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
  closeAll: () => {},
});

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return FALLBACK_STATE;
  }
  return context;
}

export default useSidebar;