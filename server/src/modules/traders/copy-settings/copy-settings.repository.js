/**
 * Copy Settings Repository
 *
 * @module signalforge/server/modules/traders/copy-settings/repository
 */

import { TraderRepository } from '../trader.repository.js';

export class CopySettingsRepository {
  constructor(db = null) {
    this.traderRepository = new TraderRepository(db);
  }

  async find(traderId, followerId) {
    return this.traderRepository.findFollower(traderId, followerId);
  }

  async findById(followerId) {
    return this.traderRepository.findFollowerById(followerId);
  }

  async update(followerId, data) {
    return this.traderRepository.updateFollower(followerId, data);
  }
}

export default CopySettingsRepository;