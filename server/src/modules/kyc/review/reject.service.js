/**
 * KYC Reject Service
 *
 * @module signalforge/server/modules/kyc/review/reject
 */
const { ReviewRepository } = require('./review.repository.js');
const { KycReviewAlreadyDecidedError, KycApplicationNotFoundError } = require('../kyc.errors.js');
const { emitApplicationRejected, emitStatusChanged } = require('../kyc.events.js');
class RejectService {
  constructor(repository = null) {
    this.repository = repository || new ReviewRepository();
  }

  async reject(applicationId, reviewerId, reason, notes = null) {
    const application = await this.repository.findApplication(applicationId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }

    if (['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(application.status)) {
      throw new KycReviewAlreadyDecidedError();
    }

    const oldStatus = application.status;

    await this.repository.updateApplication(applicationId, {
      status: 'REJECTED',
      reviewerId,
      rejectionReason: reason,
      reviewNotes: notes,
      reviewedAt: new Date(),
    });

    await this.repository.updateUserKycStatus(application.user_id, 'REJECTED');

    await this.repository.createAuditLog({
      applicationId,
      userId: application.user_id,
      actorId: reviewerId,
      actorType: 'REVIEWER',
      action: 'REJECTED',
      oldStatus,
      newStatus: 'REJECTED',
      reason,
    });

    await emitApplicationRejected(application.user_id, applicationId, reviewerId, reason);
    await emitStatusChanged(application.user_id, applicationId, oldStatus, 'REJECTED', reviewerId);

    return { rejected: true };
  }
}
module.exports = RejectService;
module.exports.RejectService = RejectService;
