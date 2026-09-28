/**
 * KYC Audit Service
 *
 * @module signalforge/server/modules/kyc/audit/service
 */
const { KycAuditRepository } = require('./kyc-audit.repository.js');
class KycAuditService {
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
module.exports = KycAuditService;
module.exports.KycAuditService = KycAuditService;
