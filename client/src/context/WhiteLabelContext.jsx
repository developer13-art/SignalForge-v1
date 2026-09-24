/**
 * White Label Context
 *
 * Resolves the active white-label project (if any) based on the
 * current hostname or a query parameter, exposes the branding and
 * theme configuration, and applies the primary/secondary colors as
 * CSS variables on the root element.
 *
 * @module client/src/context/WhiteLabelContext
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { whiteLabelApi } from '../api/white-label.api.js';
import appConfig from '../config/app.config.js';

const WhiteLabelContext = createContext(null);

function readStoredConfig() {
  try {
    const raw = localStorage.getItem(appConfig.storage.whiteLabelKey);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function WhiteLabelProvider({ children }) {
  const [config, setConfig] = useState(readStoredConfig);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : null;
        const result = await whiteLabelApi.resolve({ hostname });
        if (!cancelled && result) {
          setConfig(result);
          try {
            localStorage.setItem(appConfig.storage.whiteLabelKey, JSON.stringify(result));
          } catch (err) {
            // ignore storage errors
          }
        }
      } catch (err) {
        // no white label configured — fall back to defaults
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }
    const root = document.documentElement;
    if (config.primaryColor) {
      root.style.setProperty('--color-primary-500', config.primaryColor);
    }
    if (config.secondaryColor) {
      root.style.setProperty('--color-surface', config.secondaryColor);
    }
    if (config.brandName) {
      document.title = config.brandName;
    }
  }, [config]);

  const value = useMemo(() => {
    return {
      config,
      isLoading,
      brandName: config ? config.brandName || appConfig.name : appConfig.name,
      logoUrl: config ? config.logoUrl || null : null,
      faviconUrl: config ? config.faviconUrl || null : null,
      primaryColor: config ? config.primaryColor || null : null,
      supportEmail: config ? config.supportEmail || appConfig.supportEmail : appConfig.supportEmail,
      isWhiteLabel: Boolean(config),
    };
  }, [config, isLoading]);

  return <WhiteLabelContext.Provider value={value}>{children}</WhiteLabelContext.Provider>;
}

export function useWhiteLabelContext() {
  const ctx = useContext(WhiteLabelContext);
  if (!ctx) {
    throw new Error('useWhiteLabelContext must be used within a WhiteLabelProvider');
  }
  return ctx;
}

export { WhiteLabelContext };
export default WhiteLabelContext;