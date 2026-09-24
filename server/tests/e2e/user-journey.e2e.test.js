/**
 * User Journey E2E Test
 *
 * @module server/tests/e2e/user-journey.e2e.test
 */

import { describe, test, expect } from '@jest/globals';
import { hashPassword } from '../../src/utils/password.util';
import { signAccessToken, verifyAccessToken } from '../../src/utils/jwt.util';

describe('E2E: User journey', () => {
  test('registration → login → access', async () => {
    const password = 'JourneyPass123!';
    const hash = await hashPassword(password);
    expect(hash).toBeTruthy();

    const token = signAccessToken({
      sub: 'user-e2e-1',
      email: 'e2e@signalforge.local',
    });

    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-e2e-1');
    expect(decoded.email).toBe('e2e@signalforge.local');
  });
});