/**
 * DNA Version Repository
 *
 * @module signalforge/server/modules/provider-dna/versioning/repository
 */

import { DnaRepository } from '../dna.repository.js';

export class VersionRepository {
  constructor(db = null) {
    this.dnaRepository = new DnaRepository(db);
  }

  async create(data) {
    return this.dnaRepository.createVersion(data);
  }

  async listByProvider(providerId, limit) {
    return this.dnaRepository.listVersions(providerId, limit);
  }

  async findById(versionId) {
    return this.dnaRepository.findVersionById(versionId);
  }

  async prune(providerId, keepCount) {
    return this.dnaRepository.pruneVersions(providerId, keepCount);
  }
}

export default VersionRepository;