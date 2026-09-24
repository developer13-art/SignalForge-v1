/**
 * Users Unit Tests
 *
 * @module server/tests/unit/users.test
 */

import { describe, test, expect } from '@jest/globals';
import { serializeUser } from '../../src/lib/serializers/user.serializer';

describe('User serializer', () => {
  test('serializeUser returns expected shape', () => {
    const user = {
      id: 'u1',
      email: 'a@b.c',
      username: 'test',
      first_name: 'A',
      middle_name: null,
      last_name: 'B',
      avatar_url: null,
      status: 'ACTIVE',
      kyc_status: 'VERIFIED',
      account_type: 'USER',
      email_verified_at: '2024-01-01T00:00:00Z',
      phone_verified_at: null,
      last_login_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const result = serializeUser(user);
    expect(result.userId).toBe('u1');
    expect(result.email).toBe('a@b.c');
    expect(result.status).toBe('ACTIVE');
    expect(result.kycStatus).toBe('VERIFIED');
  });

  test('serializeUser returns null for null input', () => {
    expect(serializeUser(null)).toBeNull();
  });
});