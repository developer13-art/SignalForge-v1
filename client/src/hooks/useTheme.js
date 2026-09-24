/**
 * useTheme Hook
 *
 * Convenience hook to read and update the current theme from the
 * ThemeContext without importing the context directly. Also exposes
 * the resolved theme and a toggle.
 *
 * @module client/src/hooks/useTheme
 */

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export default useTheme;