import { beforeEach, describe, expect, it } from 'vitest';

import { appConfig } from '../config/app.config.js';
import { attachInterceptors } from './interceptors.js';

function createStorageMock() {
  const store = new Map();

  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('attachInterceptors', () => {
  beforeEach(() => {
    const storage = createStorageMock();
    globalThis.window = {
      localStorage: storage,
      location: { pathname: '/dashboard' },
    };
  });

  it('attaches the bearer token when it is stored under the canonical key', async () => {
    const accessToken = 'token-123';
    window.localStorage.setItem(appConfig.storage.accessTokenKey, accessToken);

    const requestHandlers = {};
    const responseHandlers = {};

    const client = {
      interceptors: {
        request: {
          use: (onFulfilled, onRejected) => {
            requestHandlers.onFulfilled = onFulfilled;
            requestHandlers.onRejected = onRejected;
          },
        },
        response: {
          use: (onFulfilled, onRejected) => {
            responseHandlers.onFulfilled = onFulfilled;
            responseHandlers.onRejected = onRejected;
          },
        },
      },
    };

    attachInterceptors(client);

    const config = await requestHandlers.onFulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe(`Bearer ${accessToken}`);
    expect(typeof responseHandlers.onFulfilled).toBe('function');
  });
});
