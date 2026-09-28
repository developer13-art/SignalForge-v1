/**
 * KYC Reject Service
 *
 * @module signalforge/server/modules/kyc/review/reject
 */

import { ReviewRepository } from './review.repository.js';
import { KycReviewAlreadyDecidedError, KycApplicationNotFoundError } from '../kyc.errors.js';
import { emitApplicationRejected, emitStatusChanged } from '../kyc.events.js';

export class RejectService {
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

export default RejectService;