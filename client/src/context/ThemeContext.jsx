/**
 * Theme Context
 *
 * Stores the current theme (`dark` | `light` | `system`), resolves it
 * against the system preference, applies the corresponding class on
 * the root element, and persists the choice to localStorage.
 *
 * @module client/src/context/ThemeContext
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import appConfig from '../config/app.config.js';

const ThemeContext = createContext(null);

const VALID_THEMES = ['dark', 'light', 'system'];

function readStoredTheme() {
  try {
    const value = localStorage.getItem(appConfig.storage.themeKey);
    return VALID_THEMES.includes(value) ? value : 'dark';
  } catch (err) {
    return 'dark';
  }
}

function resolveTheme(theme) {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(readStoredTheme()));

  const applyTheme = useCallback((nextTheme) => {
    const resolved = resolveTheme(nextTheme);
    const root = document.documentElement;

    root.classList.toggle('dark', resolved === 'dark');
    root.classList.toggle('light', resolved === 'light');
    root.setAttribute('data-theme', resolved);

    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const setTheme = useCallback((nextTheme) => {
    if (!VALID_THEMES.includes(nextTheme)) {
      return;
    }
    setThemeState(nextTheme);
    try {
      localStorage.setItem(appConfig.storage.themeKey, nextTheme);
    } catch (err) {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      isLight: resolvedTheme === 'light',
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return ctx;
}

export { ThemeContext };
export default ThemeContext;