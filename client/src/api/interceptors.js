/**
 * API Interceptors
 *
 * Request and response interceptors for the shared API client. Handles
 * bearer token injection, request id propagation, tenant header
 * resolution, response error normalization, and the redirect-to-login
 * rule on 401 responses.
 *
 * @module client/src/api/interceptors
 */

import { appConfig } from '../config/app.config.js';
import { storage } from '../lib/utils/storage.util.js';

function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Reads the access token. Two keys are checked because the auth
 * context and the interceptor historically used different key names.
 * Prefer the key from appConfig; fall back to the literal name.
 */
function readStorageValue(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const direct = window.localStorage.getItem(key);
      if (direct !== null && direct !== undefined) {
        return direct;
      }
    }
  } catch (_storageError) {
    // Ignore storage access issues and continue to fallbacks.
  }

  const fallbackKeys = [];
  if (key && key.startsWith('signalforge.')) {
    fallbackKeys.push(key.replace(/^signalforge\./, ''));
  }
  fallbackKeys.push(key.replace(/^signalforge\./, ''));
  fallbackKeys.push(key.replace(/^(signalforge\.)?/, ''));

  for (const candidate of fallbackKeys) {
    const value = storage.local.get(candidate);
    if (value) {
      return value;
    }
  }

  return null;
}

function readAccessToken() {
  const keys = new Set([
    appConfig?.storage?.accessTokenKey,
    'signalforge.access_token',
    'signalforge.accessToken',
    'access_token',
    'accessToken',
  ]);

  for (const key of keys) {
    if (!key) continue;
    const value = readStorageValue(key);
    if (value) {
      return value;
    }
  }

  return null;
}

export function attachInterceptors(client) {
  client.interceptors.request.use(
    (config) => {
      const token = readAccessToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.headers = config.headers || {};
      config.headers['X-Request-Id'] = generateRequestId();
      config.headers['X-Client-Version'] = appConfig.version;

      const whiteLabel = storage.local.get(appConfig.storage.whiteLabelKey);
      if (whiteLabel && whiteLabel.slug) {
        config.headers['X-White-Label'] = whiteLabel.slug;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        status: null,
        details: null,
      };

      if (error.response) {
        normalized.status = error.response.status;
        const data = error.response.data || {};
        normalized.message =
          (data.error && data.error.message) ||
          data.message ||
          error.response.statusText ||
          'Request failed';
        normalized.code = (data.error && data.error.code) || `HTTP_${error.response.status}`;
        normalized.details = (data.error && data.error.details) || null;

        // On 401, clear the session and force the user to the login page.
        // The dashboard and other protected pages rely on this so they
        // do not spin forever when the token is missing or expired.
        if (error.response.status === 401) {
          try {
            if (appConfig?.storage?.accessTokenKey) {
              storage.local.remove(appConfig.storage.accessTokenKey);
            }
            if (appConfig?.storage?.refreshTokenKey) {
              storage.local.remove(appConfig.storage.refreshTokenKey);
            }
            storage.local.remove('access_token');
            storage.local.remove('refresh_token');
          } catch (_storageError) {
            // Ignore storage errors.
          }

          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')
          ) {
            window.location.assign('/login');
          }
        }
      } else if (error.request) {
        normalized.message = 'Network error — please check your connection';
        normalized.code = 'NETWORK_ERROR';
      } else if (error.code === 'ECONNABORTED') {
        normalized.message = 'Request timed out';
        normalized.code = 'REQUEST_TIMEOUT';
      } else {
        normalized.message = error.message || normalized.message;
      }

      return Promise.reject(normalized);
    },
  );

  return client;
}

export default attachInterceptors;