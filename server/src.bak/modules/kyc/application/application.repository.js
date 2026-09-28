/**
 * KYC Application Repository
 *
 * Thin wrapper around the KYC repository's application methods.
 *
 * @module signalforge/server/modules/kyc/application/repository
 */

import { KycRepository } from '../kyc.repository.js';

export class ApplicationRepository {
  constructor(db = null) {
    this.kycRepository = new KycRepository(db);
  }

  async findByUserId(userId) {
    return this.kycRepository.findApplicationByUserId(userId);
  }

  async findActiveByUserId(userId) {
    return this.kycRepository.findActiveApplicationByUserId(userId);
  }

  async findById(applicationId) {
    return this.kycRepository.findApplicationById(applicationId);
  }

  async create(data) {
    return this.kycRepository.createApplication(data);
  }

  async update(applicationId, data) {
    return this.kycRepository.updateApplication(applicationId, data);
  }

  async list(filters, pagination) {
    return this.kycRepository.listApplications(filters, pagination);
  }

  async countByStatus() {
    return this.kycRepository.countByStatus();
  }

  async findExpired(before = null) {
    return this.kycRepository.findExpiredApplications(before);
  }

  async updateUserKycStatus(userId, status) {
    return this.kycRepository.updateUserKycStatus(userId, status);
  }
}

export default ApplicationRepository;