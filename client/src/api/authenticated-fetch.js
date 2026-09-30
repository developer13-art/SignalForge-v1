import { readAccessToken } from './interceptors.js';

export function authenticatedFetch(input, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = readAccessToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...options,
    credentials: 'include',
    headers,
  });
}