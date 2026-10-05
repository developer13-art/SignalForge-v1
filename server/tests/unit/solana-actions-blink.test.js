import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const actionsRepository = require('../../src/modules/solana/actions/actions.repository.js');
const actionsService = require('../../src/modules/solana/actions/actions.service.js');

describe('Solana Actions Blink creation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates a free referral Blink without requiring a payment amount', async () => {
    jest.spyOn(actionsRepository, 'isEnabled').mockResolvedValue(true);
    jest.spyOn(actionsRepository, 'createBlink').mockImplementation(async (_client, blink) => blink);

    const blink = await actionsService.createBlink({
      templateType: 'referral',
      referralCode: 'JOIN1234',
      title: 'Join SignalForge',
      description: 'Join through a referral.',
      label: 'Join',
    });

    expect(blink.amount).toBe(0);
  });

  test('still requires a positive payment amount for subscription Blinks', async () => {
    jest.spyOn(actionsRepository, 'isEnabled').mockResolvedValue(true);

    await expect(
      actionsService.createBlink({
        templateType: 'subscribe',
        planId: 'BASIC',
        title: 'Subscribe',
        description: 'Subscribe to a plan.',
        label: 'Subscribe',
      }),
    ).rejects.toThrow('amount must be a finite number');
  });
});
