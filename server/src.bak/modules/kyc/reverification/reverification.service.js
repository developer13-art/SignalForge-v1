/**
 * KYC Reverification Service
 *
 * Manages reverification workflows triggered by document expiry,
 * profile changes, suspicious activity, or a compliance directive.
 *
 * @module signalforge/server/modules/kyc/reverification/service
 */

import { ApplicationRepository } from '../application/application.repository.js';
import { KycRepository } from '../kyc.repository.js';
import { KycApplicationNotFoundError } from '../kyc.errors.js';
import { emitReverificationRequired, emitStatusChanged } from '../kyc.events.js';

export class ReverificationService {
  constructor(dependencies = {}) {
    this.applicationRepository = dependencies.applicationRepository || new ApplicationRepository();
    this.kycRepository = dependencies.kycRepository || new KycRepository();
  }

  async trigger(userId, reason) {
    const application = await this.applicationRepository.findByUserId(userId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }

    const oldStatus = application.status;

    await this.applicationRepository.update(application.id, {
      status: 'EXPIRED',
    });

    await this.kycRepository.updateUserKycStatus(userId, 'EXPIRED');

    await this.kycRepository.createAuditLog({
      applicationId: application.id,
      userId,
      actorId: null,
      actorType: 'SYSTEM',
      action: 'REVERIFICATION_TRIGGERED',
      oldStatus,
      newStatus: 'EXPIRED',
      reason,
    });

    await emitReverificationRequired(userId, application.id, reason);
    await emitStatusChanged(userId, application.id, oldStatus, 'EXPIRED', null);

    return { triggered: true, applicationId: application.id };
  }
}

export default ReverificationService;