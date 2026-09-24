/**
 * API Interceptors
 *
 * Request and response interceptors for the shared API client. Handles
 * bearer token injection, request id propagation, tenant header
 * resolution, and response error normalization.
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

export function attachInterceptors(client) {
  client.interceptors.request.use(
    (config) => {
      const token = storage.local.get('access_token');

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