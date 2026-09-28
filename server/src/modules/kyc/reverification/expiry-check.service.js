/**
 * KYC Expiry Check Service
 *
 * @module signalforge/server/modules/kyc/reverification/expiry-check
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { ApplicationRepository } = require('../application/application.repository.js');
const { KycRepository } = require('../kyc.repository.js');
const { emitKycExpired, emitStatusChanged } = require('../kyc.events.js');
class ExpiryCheckService {
  constructor(dependencies = {}) {
    this.applicationRepository = dependencies.applicationRepository || new ApplicationRepository();
    this.kycRepository = dependencies.kycRepository || new KycRepository();
    this.logger = getLogger('kyc-expiry');
  }

  async checkExpired() {
    const expired = await this.applicationRepository.findExpired();
    let processed = 0;

    for (const app of expired) {
      try {
        await this.applicationRepository.update(app.id, { status: 'EXPIRED' });
        await this.kycRepository.updateUserKycStatus(app.user_id, 'EXPIRED');

        await this.kycRepository.createAuditLog({
          applicationId: app.id,
          userId: app.user_id,
          actorId: null,
          actorType: 'SYSTEM',
          action: 'EXPIRED',
          oldStatus: 'VERIFIED',
          newStatus: 'EXPIRED',
          reason: 'KYC verification expired',
        });

        await emitKycExpired(app.user_id, app.id);
        await emitStatusChanged(app.user_id, app.id, 'VERIFIED', 'EXPIRED', null);

        processed++;
      } catch (error) {
        this.logger.error({ err: error, applicationId: app.id }, 'Failed to expire KYC');
      }
    }

    return { processed };
  }
}
module.exports = ExpiryCheckService;
module.exports.ExpiryCheckService = ExpiryCheckService;
