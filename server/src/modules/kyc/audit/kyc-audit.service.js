/**
 * KYC Audit Service
 *
 * @module signalforge/server/modules/kyc/audit/service
 */

import { KycAuditRepository } from './kyc-audit.repository.js';

export class KycAuditService {
  constructor(repository = null) {
    this.repository = repository || new KycAuditRepository();
  }

  async log(data) {
    return this.repository.create(data);
  }

  async list(applicationId) {
    return this.repository.list(applicationId);
  }
}

export default KycAuditService;