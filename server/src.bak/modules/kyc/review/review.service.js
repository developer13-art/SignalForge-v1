/**
 * KYC Review Service
 *
 * @module signalforge/server/modules/kyc/review/service
 */

import { ApproveService } from './approve.service.js';
import { RejectService } from './reject.service.js';
import { ResubmitService } from './resubmit.service.js';
import { ReviewRepository } from './review.repository.js';

export class ReviewService {
  constructor(repository = null) {
    this.repository = repository || new ReviewRepository();
    this.approveService = new ApproveService(this.repository);
    this.rejectService = new RejectService(this.repository);
    this.resubmitService = new ResubmitService(this.repository);
  }

  async approve(applicationId, reviewerId, notes) {
    return this.approveService.approve(applicationId, reviewerId, notes);
  }

  async reject(applicationId, reviewerId, reason, notes) {
    return this.rejectService.reject(applicationId, reviewerId, reason, notes);
  }

  async requestResubmission(applicationId, reviewerId, reason, notes) {
    return this.resubmitService.requestResubmission(applicationId, reviewerId, reason, notes);
  }

  async listAuditLogs(applicationId) {
    return this.repository.listAuditLogs(applicationId);
  }
}

export default ReviewService;