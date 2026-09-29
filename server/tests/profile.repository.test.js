const { describe, it, expect, jest } = require('@jest/globals');
const { ProfileRepository } = require('../src/modules/users/profile/profile.repository.js');

describe('ProfileRepository', () => {
  it('uses the actual user_profiles schema columns when loading a profile', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    const repo = new ProfileRepository(db);
    await repo.findByUserId('11111111-1111-1111-1111-111111111111');

    const [sql] = db.query.mock.calls[0];

    expect(sql).toContain('user_id AS id');
    expect(sql).toContain('address_line1');
    expect(sql).toContain('referred_by_user_id');
    expect(sql).not.toMatch(/\bSELECT id\b/i);
    expect(sql).not.toMatch(/\bstate\b/i);
    expect(sql).not.toMatch(/\baddress\b/i);
    expect(sql).not.toMatch(/\bbio\b/i);
    expect(sql).not.toMatch(/\bpreferences\b/i);
  });
});
