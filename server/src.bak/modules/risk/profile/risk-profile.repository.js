/**
 * Risk Profile Repository
 *
 * @module signalforge/server/modules/risk/profile/repository
 */

import { RiskRepository } from '../risk.repository.js';

export class RiskProfileRepository {
  constructor(db = null) {
    this.riskRepository = new RiskRepository(db);
  }

  async findByUserId(userId) {
    return this.riskRepository.findProfileByUserId(userId);
  }

  async findByUserAndAccount(userId, brokerAccountId) {
    return this.riskRepository.findProfileByUserAndAccount(userId, brokerAccountId);
  }

  async findById(profileId) {
    return this.riskRepository.findProfileById(profileId);
  }

  async create(data) {
    return this.riskRepository.createProfile(data);
  }

  async update(profileId, data) {
    return this.riskRepository.updateProfile(profileId, data);
  }

  async delete(profileId) {
    return this.riskRepository.deleteProfile(profileId);
  }
}

export default RiskProfileRepository;