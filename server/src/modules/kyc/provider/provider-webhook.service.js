/**
 * KYC Provider Webhook Service
 *
 * Handles inbound webhooks from KYC providers and applies the
 * resulting status to the corresponding application.
 *
 * @module signalforge/server/modules/kyc/provider/webhook
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { ProviderFactory } from './provider.factory.js';
import { ApplicationRepository } from '../application/application.repository.js';
import { KycRepository } from '../kyc.repository.js';
import { VERIFICATION_RESULTS } from '../kyc.constants.js';
import { KycApplicationNotFoundError } from '../kyc.errors.js';
import { emitStatusChanged, emitApplicationApproved } from '../kyc.events.js';

export class ProviderWebhookService {
  constructor(dependencies = {}) {
    this.applicationRepository = dependencies.applicationRepository || new ApplicationRepository();
    this.kycRepository = dependencies.kycRepository || new KycRepository();
    this.logger = getLogger('kyc-webhook');
  }

  async handle(providerName, payload) {
    const provider = ProviderFactory.create(providerName);
    const normalized = await provider.handleWebhook(payload);

    const application = await this.applicationRepository.findById(normalized.applicationId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }

    const newStatus =
      normalized.result === VERIFICATION_RESULTS.PASSED
        ? 'VERIFIED'
        : 'REJECTED';

    const oldStatus = application.status;

    await this.applicationRepository.update(application.id, {
      status: newStatus,
      verifiedAt: newStatus === 'VERIFIED' ? new Date() : null,
      provider: provider.name,
      providerReference: provider.getProviderReference(normalized.raw),
    });

    await this.kycRepository.updateUserKycStatus(application.user_id, newStatus);

    await this.kycRepository.createAuditLog({
      applicationId: application.id,
      userId: application.user_id,
      actorId: null,
      actorType: 'PROVIDER',
      action: `WEBHOOK_${providerName.toUpperCase()}`,
      oldStatus,
      newStatus,
      metadata: { providerResponse: normalized.raw },
    });

    await emitStatusChanged(application.user_id, application.id, oldStatus, newStatus, null);

    if (newStatus === 'VERIFIED') {
      await emitApplicationApproved(application.user_id, application.id, null);
    }

    this.logger.info(
      { applicationId: application.id, status: newStatus, provider: providerName },
      'KYC webhook processed',
    );

    return { processed: true, applicationId: application.id, status: newStatus };
  }
}

export default ProviderWebhookService;