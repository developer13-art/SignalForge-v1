/**
 * Notification Unit Tests
 *
 * @module server/tests/unit/notification.test
 */

import { describe, test, expect } from '@jest/globals';

function isWithinQuietHours({ currentMinutes, start, end }) {
  if (start <= end) {
    return currentMinutes >= start && currentMinutes < end;
  }
  return currentMinutes >= start || currentMinutes < end;
}

describe('Notification quiet hours', () => {
  test('within same-day window', () => {
    expect(isWithinQuietHours({ currentMinutes: 600, start: 500, end: 700 })).toBe(true);
    expect(isWithinQuietHours({ currentMinutes: 800, start: 500, end: 700 })).toBe(false);
  });

  test('across midnight window', () => {
    expect(isWithinQuietHours({ currentMinutes: 30, start: 1200, end: 400 })).toBe(true);
    expect(isWithinQuietHours({ currentMinutes: 800, start: 1200, end: 400 })).toBe(false);
  });
});