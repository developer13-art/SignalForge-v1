/**
 * Document Upload Service
 *
 * Handles the upload of KYC documents and selfies, including file
 * validation, quality checks, duplicate detection, and storage.
 *
 * @module signalforge/server/modules/kyc/documents/document-upload
 */

import path from 'node:path';
import crypto from 'node:crypto';

import { getLogger } from '../../../bootstrap/initLogger.js';
import storageConfig from '../../../config/storage.config.js';
import { DocumentRepository } from './document.repository.js';
import { FileValidationService } from './file-validation.service.js';
import { QualityCheckService } from './quality-check.service.js';
import { DuplicateDetectionService } from './duplicate-detection.service.js';
import { DocumentTypeService } from './document-type.service.js';
import {
  KycApplicationNotFoundError,
  KycDocumentNotFoundError,
} from '../kyc.errors.js';
import {
  emitDocumentUploaded,
  emitDocumentDeleted,
  emitDocumentQualityFailed,
  emitSelfieUploaded,
} from '../kyc.events.js';
import { ApplicationRepository } from '../application/application.repository.js';

export class DocumentUploadService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DocumentRepository();
    this.applicationRepository = dependencies.applicationRepository || new ApplicationRepository();
    this.fileValidation = dependencies.fileValidation || new FileValidationService();
    this.qualityCheck = dependencies.qualityCheck || new QualityCheckService();
    this.duplicateDetection = dependencies.duplicateDetection || new DuplicateDetectionService();
    this.documentTypeService = dependencies.documentTypeService || new DocumentTypeService();
    this.storage = dependencies.storage || null;
    this.logger = getLogger('kyc-upload');
  }

  buildStorageKey(userId, applicationId, kind, originalName) {
    const ext = path.extname(originalName || '').toLowerCase() || '.bin';
    const unique = crypto.randomBytes(8).toString('hex');
    const basePath = kind === 'selfie'
      ? storageConfig.paths.kycSelfies
      : storageConfig.paths.kycDocuments;
    return `${basePath}/${userId}/${applicationId}/${Date.now()}-${unique}${ext}`;
  }

  async getActiveApplication(userId) {
    const application = await this.applicationRepository.findActiveByUserId(userId);
    if (!application) {
      throw new KycApplicationNotFoundError();
    }
    return application;
  }

  async uploadDocument(userId, payload, file) {
    const application = await this.getActiveApplication(userId);

    await this.documentTypeService.assertValid(payload.documentType);

    const validation = this.fileValidation.validateDocumentFile(file);

    const quality = await this.qualityCheck.checkDocument(file, { strict: false });
    if (quality.result === 'FAILED') {
      await emitDocumentQualityFailed(userId, application.id, null, quality.reason);
    }

    await this.duplicateDetection.assertNotDuplicate(
      application.id,
      payload.documentType,
      validation.hash,
    );

    const storageKey = this.buildStorageKey(
      userId,
      application.id,
      'document',
      file.originalname,
    );

    if (this.storage) {
      await this.storage.upload(storageKey, file.buffer, {
        contentType: validation.mimeType,
        metadata: {
          userId,
          applicationId: application.id,
          documentType: payload.documentType,
        },
      });
    }

    const created = await this.repository.create({
      applicationId: application.id,
      userId,
      documentType: payload.documentType,
      storageKey,
      mimeType: validation.mimeType,
      sizeBytes: validation.size,
      encryptedNumber: validation.hash,
      qualityCheckResult: quality.result,
      qualityCheckDetails: quality.details,
    });

    await emitDocumentUploaded(
      userId,
      application.id,
      created.id,
      payload.documentType,
    );

    return this.serialize(created);
  }

  async uploadSelfie(userId, file) {
    const application = await this.getActiveApplication(userId);

    const validation = this.fileValidation.validateSelfieFile(file);
    const quality = await this.qualityCheck.checkSelfie(file, { strict: false });

    const storageKey = this.buildStorageKey(
      userId,
      application.id,
      'selfie',
      file.originalname,
    );

    if (this.storage) {
      await this.storage.upload(storageKey, file.buffer, {
        contentType: validation.mimeType,
        metadata: {
          userId,
          applicationId: application.id,
          documentType: 'SELFIE',
        },
      });
    }

    await this.repository.deleteSelfie(application.id);

    const created = await this.repository.createSelfie({
      applicationId: application.id,
      userId,
      storageKey,
      mimeType: validation.mimeType,
      sizeBytes: validation.size,
      qualityCheckResult: quality.result,
    });

    await emitSelfieUploaded(userId, application.id, created.id);

    return {
      id: created.id,
      storageKey: created.storage_key,
      mimeType: validation.mimeType,
      size: validation.size,
      quality: quality.result,
      createdAt: created.created_at,
    };
  }

  async listDocuments(userId) {
    const application = await this.getActiveApplication(userId);
    const documents = await this.repository.listByApplication(application.id);
    return documents.map((d) => this.serialize(d));
  }

  async getDocument(userId, documentId) {
    const document = await this.repository.findById(documentId);
    if (!document || document.user_id !== userId) {
      throw new KycDocumentNotFoundError();
    }
    return this.serialize(document);
  }

  async deleteDocument(userId, documentId) {
    const document = await this.repository.findById(documentId);
    if (!document || document.user_id !== userId) {
      throw new KycDocumentNotFoundError();
    }

    if (this.storage) {
      try {
        await this.storage.delete(document.storage_key);
      } catch (error) {
        this.logger.warn({ err: error, documentId }, 'Failed to delete document file');
      }
    }

    await this.repository.delete(documentId);

    await emitDocumentDeleted(userId, document.application_id, documentId);

    return { deleted: true };
  }

  async getDocumentSignedUrl(userId, documentId, ttlSeconds = null) {
    const document = await this.repository.findById(documentId);
    if (!document || document.user_id !== userId) {
      throw new KycDocumentNotFoundError();
    }
    if (!this.storage) {
      return { url: document.storage_key };
    }
    const ttl = ttlSeconds || storageConfig.signedUrl.ttlSeconds;
    const url = await this.storage.getSignedUrl(document.storage_key, ttl);
    return { url, expiresIn: ttl };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      applicationId: row.application_id,
      documentType: row.document_type,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      qualityCheckResult: row.quality_check_result,
      createdAt: row.created_at,
    };
  }
}

export default DocumentUploadService;