/**
 * KYC Audit Repository
 *
 * @module signalforge/server/modules/kyc/audit/repository
 */
const { KycRepository } = require('../kyc.repository.js');
class KycAuditRepository {
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
module.exports = KycAuditRepository;
module.exports.KycAuditRepository = KycAuditRepository;
