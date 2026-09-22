/**
 * KYC Audit Repository
 *
 * @module signalforge/server/modules/kyc/audit/repository
 */

import { KycRepository } from '../kyc.repository.js';

export class KycAuditRepository {
  constructor(db = null) {
    this.kycRepository = new KycRepository(db);
  }

  async create(data) {
    return this.kycRepository.createAuditLog(data);
  }

  async list(applicationId) {
    return this.kycRepository.listAuditLogs(applicationId);
  }
}

export default KycAuditRepository;