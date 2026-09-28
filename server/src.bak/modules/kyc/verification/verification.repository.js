/**
 * KYC Verification Repository
 *
 * @module signalforge/server/modules/kyc/verification/repository
 */

import { KycRepository } from '../kyc.repository.js';

export class VerificationRepository {
  constructor(db = null) {
    this.kycRepository = new KycRepository(db);
  }

  async create(data) {
    return this.kycRepository.createVerification(data);
  }

  async findLatest(applicationId) {
    return this.kycRepository.findVerificationByApplication(applicationId);
  }

  async list(applicationId) {
    return this.kycRepository.listVerificationsByApplication(applicationId);
  }

  async createAuditLog(data) {
    return this.kycRepository.createAuditLog(data);
  }

  async listAuditLogs(applicationId) {
    return this.kycRepository.listAuditLogs(applicationId);
  }
}

export default VerificationRepository;