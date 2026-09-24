/**
 * Certification Repository
 *
 * @module signalforge/server/modules/providers/certification/repository
 */

import { ProviderRepository } from '../provider.repository.js';

export class CertificationRepository {
  constructor(db = null) {
    this.providerRepository = new ProviderRepository(db);
  }

  async create(data) {
    return this.providerRepository.createCertification(data);
  }

  async findById(certificationId) {
    return this.providerRepository.findCertificationById(certificationId);
  }

  async findLatest(providerId) {
    return this.providerRepository.findLatestCertification(providerId);
  }

  async list(providerId, pagination) {
    return this.providerRepository.listCertifications(providerId, pagination);
  }

  async update(certificationId, data) {
    return this.providerRepository.updateCertification(certificationId, data);
  }

  async findExpired(referenceTime) {
    return this.providerRepository.findExpiredCertifications(referenceTime);
  }
}

export default CertificationRepository;