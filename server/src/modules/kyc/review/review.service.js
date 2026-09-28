/**
 * KYC Review Service
 *
 * @module signalforge/server/modules/kyc/review/service
 */
const { ApproveService } = require('./approve.service.js');
const { RejectService } = require('./reject.service.js');
const { ResubmitService } = require('./resubmit.service.js');
const { ReviewRepository } = require('./review.repository.js');
class ReviewService {
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
module.exports = ReviewService;
module.exports.ReviewService = ReviewService;
