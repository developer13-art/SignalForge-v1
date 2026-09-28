/**
 * KYC Application Service
 *
 * @module signalforge/server/modules/kyc/application/service
 */

import { ApplicationRepository } from './application.repository.js';
import {
  KycApplicationNotFoundError,
  KycApplicationAlreadyExistsError,
  KycApplicationNotSubmittableError,
  KycSelfieRequiredError,
  KycDocumentRequiredError,
  KycAlreadyVerifiedError,
} from '../kyc.errors.js';
import { KycRepository } from '../kyc.repository.js';
import {
  emitApplicationCreated,
  emitApplicationSubmitted,
  emitApplicationUpdated,
  emitResubmissionCompleted,
  emitStatusChanged,
} from '../kyc.events.js';
import { KYC_DOCUMENT_TYPES } from '../kyc.constants.js';

export class ApplicationService {
  constructor(repository = null) {
    this.repository = repository || new ApplicationRepository();
    this.kycRepository = new KycRepository();
  }

  async getOrCreateForUser(userId) {
    const existing = await this.repository.findActiveByUserId(userId);
    if (existing) {
      return this.serialize(existing);
    }
    const lastApplication = await this.repository.findByUserId(userId);
    if (lastApplication && lastApplication.status === 'VERIFIED') {
      throw new KycAlreadyVerifiedError();
    }

    const created = await this.repository.create({
      userId,
      status: 'PENDING',
      provider: null,
      personalInfo: null,
      documentType: null,
    });

    await emitApplicationCreated(userId, created.id);

    return this.serialize(created);
  }

  async getById(applicationId, requesterId = null) {
    const application = await this.repository.findById(applicationId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }
    if (requesterId && application.user_id !== requesterId) {
      throw new KycApplicationNotFoundError();
    }
    return this.serialize(application);
  }

  async getByUserId(userId) {
    const application = await this.repository.findByUserId(userId);
    if (!application) {
      return null;
    }
    return this.serialize(application);
  }

  async updatePersonalInfo(userId, payload) {
    let application = await this.repository.findActiveByUserId(userId);
    if (!application) {
      application = await this.repository.create({
        userId,
        status: 'PENDING',
        personalInfo: payload,
      });
      await emitApplicationCreated(userId, application.id);
    }

    if (application.status === 'VERIFIED') {
      throw new KycAlreadyVerifiedError();
    }
    if (['UNDER_REVIEW', 'APPROVED'].includes(application.status)) {
      throw new KycApplicationNotSubmittableError();
    }

    await this.repository.update(application.id, { personalInfo: payload });

    const updated = await this.repository.findById(application.id);
    await emitApplicationUpdated(userId, application.id, ['personalInfo']);

    return this.serialize(updated);
  }

  async submit(userId) {
    const application = await this.repository.findActiveByUserId(userId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }

    if (!['PENDING', 'REJECTED'].includes(application.status)) {
      throw new KycApplicationNotSubmittableError(undefined, {
        currentStatus: application.status,
      });
    }

    const documents = await this.kycRepository.listDocumentsByApplication(application.id);
    const hasDocument = documents.some(
      (d) => d.document_type !== 'SELFIE' && d.document_type !== null,
    );
    if (!hasDocument) {
      throw new KycDocumentRequiredError();
    }

    const hasSelfie = documents.some((d) => d.document_type === 'SELFIE');
    if (!hasSelfie) {
      throw new KycSelfieRequiredError();
    }

    const updated = await this.repository.update(application.id, {
      status: 'UNDER_REVIEW',
      submittedAt: new Date(),
    });

    await emitApplicationSubmitted(userId, application.id);
    await emitStatusChanged(userId, application.id, application.status, 'UNDER_REVIEW', null);

    await this.kycRepository.createAuditLog({
      applicationId: application.id,
      userId,
      actorId: userId,
      actorType: 'USER',
      action: 'SUBMITTED',
      oldStatus: application.status,
      newStatus: 'UNDER_REVIEW',
    });

    return this.serialize(updated);
  }

  async resubmit(userId, payload = {}) {
    const application = await this.repository.findByUserId(userId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }

    if (!['REJECTED', 'EXPIRED'].includes(application.status)) {
      throw new KycApplicationNotSubmittableError(
        'Only rejected or expired applications may be resubmitted',
        { currentStatus: application.status },
      );
    }

    const update = {
      status: 'PENDING',
      rejectionReason: null,
      reviewNotes: null,
      reviewerId: null,
    };

    if (payload.personalInfo) {
      update.personalInfo = payload.personalInfo;
    }

    const updated = await this.repository.update(application.id, update);

    await emitResubmissionCompleted(userId, application.id);
    await emitStatusChanged(userId, application.id, application.status, 'PENDING', userId);

    await this.kycRepository.createAuditLog({
      applicationId: application.id,
      userId,
      actorId: userId,
      actorType: 'USER',
      action: 'RESUBMITTED',
      oldStatus: application.status,
      newStatus: 'PENDING',
    });

    return this.serialize(updated);
  }

  async list(filters, pagination) {
    const result = await this.repository.list(filters, pagination);
    return {
      applications: result.applications.map((a) => this.serialize(a)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async countByStatus() {
    return this.repository.countByStatus();
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
      provider: row.provider,
      providerReference: row.provider_reference,
      personalInfo: row.personal_info,
      documentType: row.document_type,
      reviewerId: row.reviewer_id,
      rejectionReason: row.rejection_reason,
      reviewNotes: row.review_notes,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      verifiedAt: row.verified_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default ApplicationService;