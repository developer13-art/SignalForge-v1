/**
 * KYC Approve Service
 *
 * @module signalforge/server/modules/kyc/review/approve
 */
const { ReviewRepository } = require('./review.repository.js');
const { DEFAULT_KYC_EXPIRY_YEARS } = require('../kyc.constants.js');
const { KycReviewAlreadyDecidedError, KycApplicationNotFoundError } = require('../kyc.errors.js');
const { emitApplicationApproved, emitStatusChanged } = require('../kyc.events.js');
class ApproveService {
  constructor(repository = null) {
    this.repository = repository || new ReviewRepository();
  }

  async approve(applicationId, reviewerId, notes = null) {
    const application = await this.repository.findApplication(applicationId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }

    if (['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(application.status)) {
      throw new KycReviewAlreadyDecidedError();
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + DEFAULT_KYC_EXPIRY_YEARS);

    const oldStatus = application.status;

    await this.repository.updateApplication(applicationId, {
      status: 'VERIFIED',
      reviewerId,
      reviewNotes: notes,
      reviewedAt: new Date(),
      verifiedAt: new Date(),
      expiresAt,
      rejectionReason: null,
    });

    await this.repository.updateUserKycStatus(application.user_id, 'VERIFIED');

    await this.repository.createAuditLog({
      applicationId,
      userId: application.user_id,
      actorId: reviewerId,
      actorType: 'REVIEWER',
      action: 'APPROVED',
      oldStatus,
      newStatus: 'VERIFIED',
      reason: notes,
    });

    await emitApplicationApproved(application.user_id, applicationId, reviewerId);
    await emitStatusChanged(application.user_id, applicationId, oldStatus, 'VERIFIED', reviewerId);

    return { approved: true, expiresAt };
  }
}
module.exports = ApproveService;
module.exports.ApproveService = ApproveService;
