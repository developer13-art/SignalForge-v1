import { describe, expect, it } from 'vitest';

import { resolveHome } from './resolveHome.js';

describe('resolveHome', () => {
  it.each([
    ['SUPER_ADMIN', '/admin'],
    ['ADMIN', '/admin'],
    ['FINANCE_ADMIN', '/executive'],
    ['COMPLIANCE_OFFICER', '/compliance'],
    ['SUPPORT', '/support/console'],
    ['MODERATOR', '/support/console'],
    ['PROVIDER', '/provider/dashboard'],
    ['TRADER', '/trading'],
    ['USER', '/dashboard'],
  ])('routes %s to %s', (role, expectedPath) => {
    expect(resolveHome({ roles: [role] })).toBe(expectedPath);
  });

  it('prefers the highest-priority console for users with multiple roles', () => {
    expect(resolveHome({ roles: ['USER', 'ADMIN'] })).toBe('/admin');
  });
});