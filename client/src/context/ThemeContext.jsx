/**
 * ThemeContext
 *
 * Provides the current theme (light / dark / system) to the whole
 * application and exposes `useTheme()` for consumers. The theme is
 * persisted to localStorage and applied to the <html> element so
 * Tailwind's `dark:` variants work.
 *
 * @module client/src/context/ThemeContext
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
enforceDarkTheme();

const ThemeContext = createContext(null);

const STORAGE_KEY = 'signalforge.theme';
const VALID_THEMES = ['light', 'dark', 'system'];

function enforceDarkTheme() {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.classList.add('dark');
  root.classList.remove('light');
  root.style.colorScheme = 'dark';
}

function readStoredTheme() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'system';
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && VALID_THEMES.includes(raw)) {
      return raw;
    }
  } catch (_error) {
    // Ignore storage errors.
  }
  return 'system';
}

function writeStoredTheme(value) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (_error) {
    // Ignore storage errors.
  }
}

function resolveSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(preference) {
  if (preference === 'system') {
    return resolveSystemTheme();
  }
  return preference;
}

function applyThemeToDocument() {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.classList.add('dark');
  root.style.colorScheme = 'dark';
}

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [preference, setPreferenceState] = useState(
    () => readStoredTheme() || defaultTheme,
  );
  const [effective, setEffective] = useState(() =>
    resolveEffectiveTheme(readStoredTheme() || defaultTheme),
  );

  // Persist preference and apply effect whenever it changes.
  useEffect(() => {
    writeStoredTheme(preference);
    const next = resolveEffectiveTheme(preference);
    setEffective(next);
    applyThemeToDocument();
  }, [preference]);

  // React to system theme changes when the user is on "system".
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preference === 'system') {
        const next = resolveSystemTheme();
        setEffective(next);
        applyThemeToDocument();
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [preference]);

  const setTheme = useCallback((value) => {
    if (!VALID_THEMES.includes(value)) {
      return;
    }
    setPreferenceState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((current) => {
      const effectiveCurrent = resolveEffectiveTheme(current);
      return effectiveCurrent === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      theme: effective,
      preference,
      setTheme,
      toggleTheme,
      isDark: effective === 'dark',
    }),
    [effective, preference, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      preference: 'system',
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return context;
}

export default useTheme;