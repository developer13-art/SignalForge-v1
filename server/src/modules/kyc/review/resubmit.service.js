/**
 * KYC Resubmit Service
 *
 * @module signalforge/server/modules/kyc/review/resubmit
 */

import { ReviewRepository } from './review.repository.js';
import { KycApplicationNotFoundError } from '../kyc.errors.js';
import { emitResubmissionRequested, emitStatusChanged } from '../kyc.events.js';

export class ResubmitService {
  constructor(repository = null) {
    this.repository = repository || new ReviewRepository();
  }

  async requestResubmission(applicationId, reviewerId, reason, notes = null) {
    const application = await this.repository.findApplication(applicationId);
    if (!application) {
      throw new KycApplicationNotFoundError();
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
      action: 'RESUBMISSION_REQUESTED',
      oldStatus,
      newStatus: 'REJECTED',
      reason,
    });

    await emitResubmissionRequested(application.user_id, applicationId, reviewerId, reason);
    await emitStatusChanged(application.user_id, applicationId, oldStatus, 'REJECTED', reviewerId);

    return { resubmissionRequested: true };
  }
}

export default ResubmitService;