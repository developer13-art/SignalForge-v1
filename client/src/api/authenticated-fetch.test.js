import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appConfig } from '../config/app.config.js';
import { authenticatedFetch } from './authenticated-fetch.js';

describe('authenticatedFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    const values = new Map();
    globalThis.window = {
      localStorage: {
        getItem: (key) => values.get(key) || null,
      },
    };
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it('sends the stored bearer token and cookies', async () => {
    const token = 'admin-token';
    window.localStorage.getItem = (key) =>
      key === appConfig.storage.accessTokenKey ? token : null;

    await authenticatedFetch('/api/admin/users');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(options.credentials).toBe('include');
  });
});