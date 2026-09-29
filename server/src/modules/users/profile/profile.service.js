/**
 * Profile Service
 *
 * @module signalforge/server/modules/users/profile/service
 */
const { ProfileRepository } = require('./profile.repository.js');
const { ProfileNotFoundError } = require('../user.errors.js');
const { emitProfileUpdated } = require('../user.events.js');

class ProfileService {
  constructor(repository = null) {
    this.repository = repository || new ProfileRepository();
  }

  async getByUserId(userId) {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    // First access: create an empty profile so downstream clients always
    // receive a real object. This keeps the endpoint idempotent and
    // avoids the "null profile" state that stalls the dashboard.
    return this.repository.upsert(userId, {});
  }

  async getOrCreate(userId) {
    let profile = await this.repository.findByUserId(userId);
    if (!profile) {
      profile = await this.repository.upsert(userId, {});
    }
    return profile;
  }

  async update(userId, payload) {
    const existing = await this.repository.findByUserId(userId);
    if (!existing) {
      await this.repository.upsert(userId, payload);
    } else {
      await this.repository.upsert(userId, payload);
    }
    const updated = await this.repository.findByUserId(userId);
    await emitProfileUpdated(userId, updated.id);
    return updated;
  }

  async delete(userId) {
    const existing = await this.repository.findByUserId(userId);
    if (!existing) {
      throw new ProfileNotFoundError();
    }
    await this.repository.delete(userId);
    return { deleted: true };
  }
}

module.exports = ProfileService;
module.exports.ProfileService = ProfileService;