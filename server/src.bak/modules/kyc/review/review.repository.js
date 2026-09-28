/**
 * KYC Review Repository
 *
 * @module signalforge/server/modules/kyc/review/repository
 */

import { KycRepository } from '../kyc.repository.js';

export class ReviewRepository {
  constructor(db = null) {
    this.kycRepository = new KycRepository(db);
  }

  async findApplication(applicationId) {
    return this.kycRepository.findApplicationById(applicationId);
  }

  async updateApplication(applicationId, data) {
    return this.kycRepository.updateApplication(applicationId, data);
  }

  async createAuditLog(data) {
    return this.kycRepository.createAuditLog(data);
  }

  async listAuditLogs(applicationId) {
    return this.kycRepository.listAuditLogs(applicationId);
  }

  async updateUserKycStatus(userId, status) {
    return this.kycRepository.updateUserKycStatus(userId, status);
  }
}

export default ReviewRepository;