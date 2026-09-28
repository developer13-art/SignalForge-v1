/**
 * DNA Profile Repository
 *
 * @module signalforge/server/modules/provider-dna/profile/repository
 */
const { DnaRepository } = require('../dna.repository.js');

export class ProfileRepository {
  constructor(db = null) {
    this.dnaRepository = new DnaRepository(db);
  }

  async findDnaByProvider(providerId) {
    return this.dnaRepository.findDnaByProviderId(providerId);
  }

  async updateDna(providerId, data) {
    return this.dnaRepository.updateDna(providerId, data);
  }
}
module.exports = ProfileRepository;