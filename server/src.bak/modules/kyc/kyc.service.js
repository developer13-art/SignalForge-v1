/**
 * KYC Service (facade)
 *
 * @module signalforge/server/modules/kyc/service
 */

import { ApplicationService } from './application/application.service.js';
import { DocumentService } from './documents/document.service.js';
import { VerificationService } from './verification/verification.service.js';
import { ReviewService } from './review/review.service.js';
import { ReverificationService } from './reverification/reverification.service.js';
import { ExpiryCheckService } from './reverification/expiry-check.service.js';
import { KycAuditService } from './audit/kyc-audit.service.js';
import { ProviderWebhookService } from './provider/provider-webhook.service.js';
import { ProviderFactory } from './provider/provider.factory.js';
import { KycRepository } from './kyc.repository.js';

export class KycService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new KycRepository();

    this.applicationService = dependencies.applicationService || new ApplicationService();
    this.documentService = dependencies.documentService || new DocumentService(dependencies);
    this.verificationService =
      dependencies.verificationService ||
      new VerificationService({
        provider: dependencies.provider || ProviderFactory.create(),
      });
    this.reviewService = dependencies.reviewService || new ReviewService();
    this.reverificationService =
      dependencies.reverificationService || new ReverificationService();
    this.expiryCheckService =
      dependencies.expiryCheckService || new ExpiryCheckService();
    this.auditService = dependencies.auditService || new KycAuditService();
    this.webhookService =
      dependencies.webhookService || new ProviderWebhookService();
  }

  async getStatus(userId) {
    const application = await this.applicationService.getByUserId(userId);
    return {
      application,
      status: application?.status || 'NOT_STARTED',
    };
  }

  async getOrCreateApplication(userId) {
    return this.applicationService.getOrCreateForUser(userId);
  }

  async getApplication(userId) {
    return this.applicationService.getByUserId(userId);
  }

  async updatePersonalInfo(userId, payload) {
    return this.applicationService.updatePersonalInfo(userId, payload);
  }

  async submitApplication(userId) {
    return this.applicationService.submit(userId);
  }

  async resubmitApplication(userId, payload) {
    return this.applicationService.resubmit(userId, payload);
  }

  async uploadDocument(userId, payload, file) {
    return this.documentService.uploadDocument(userId, payload, file);
  }

  async uploadSelfie(userId, file) {
    return this.documentService.uploadSelfie(userId, file);
  }

  async listDocuments(userId) {
    return this.documentService.listDocuments(userId);
  }

  async deleteDocument(userId, documentId) {
    return this.documentService.deleteDocument(userId, documentId);
  }

  async getDocumentUrl(userId, documentId) {
    return this.documentService.getDocumentSignedUrl(userId, documentId);
  }

  async listDocumentTypes(filters) {
    return this.documentService.listDocumentTypes(filters);
  }

  async verify(applicationId) {
    return this.verificationService.verify(applicationId);
  }

  async getLatestVerification(applicationId) {
    return this.verificationService.getLatest(applicationId);
  }

  async approve(applicationId, reviewerId, notes) {
    return this.reviewService.approve(applicationId, reviewerId, notes);
  }

  async reject(applicationId, reviewerId, reason, notes) {
    return this.reviewService.reject(applicationId, reviewerId, reason, notes);
  }

  async requestResubmission(applicationId, reviewerId, reason, notes) {
    return this.reviewService.requestResubmission(applicationId, reviewerId, reason, notes);
  }

  async triggerReverification(userId, reason) {
    return this.reverificationService.trigger(userId, reason);
  }

  async checkExpired() {
    return this.expiryCheckService.checkExpired();
  }

  async listApplications(filters, pagination) {
    return this.applicationService.list(filters, pagination);
  }

  async getApplicationById(applicationId) {
    return this.applicationService.getById(applicationId);
  }

  async getStats() {
    return this.applicationService.countByStatus();
  }

  async listAuditLogs(applicationId) {
    return this.auditService.list(applicationId);
  }

  async handleProviderWebhook(providerName, payload) {
    return this.webhookService.handle(providerName, payload);
  }
}

export default KycService;