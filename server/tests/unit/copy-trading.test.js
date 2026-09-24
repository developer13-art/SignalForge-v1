/**
 * Copy Trading Unit Tests
 *
 * @module server/tests/unit/copy-trading.test
 */

import { describe, test, expect } from '@jest/globals';

function calculatePersonalizedVolume({ providerVolume, scalingMode, riskPercent, balance, lotSize }) {
  if (scalingMode === 'FIXED_LOT') {
    return lotSize;
  }
  if (scalingMode === 'PERCENTAGE') {
    return providerVolume * (riskPercent / 100);
  }
  if (scalingMode === 'BALANCE') {
    return (balance * riskPercent) / 10000;
  }
  return providerVolume;
}

describe('Copy trading volume personalization', () => {
  test('fixed lot mode returns configured lot size', () => {
    const result = calculatePersonalizedVolume({
      providerVolume: 0.5,
      scalingMode: 'FIXED_LOT',
      lotSize: 0.1,
    });
    expect(result).toBe(0.1);
  });

  test('percentage scaling multiplies by risk percent', () => {
    const result = calculatePersonalizedVolume({
      providerVolume: 1,
      scalingMode: 'PERCENTAGE',
      riskPercent: 50,
    });
    expect(result).toBeCloseTo(0.5);
  });
});