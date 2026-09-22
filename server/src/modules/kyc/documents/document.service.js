/**
 * Document Service (facade)
 *
 * @module signalforge/server/modules/kyc/documents/service
 */

import { DocumentUploadService } from './document-upload.service.js';
import { DocumentTypeService } from './document-type.service.js';

export class DocumentService {
  constructor(dependencies = {}) {
    this.uploadService = dependencies.uploadService || new DocumentUploadService(dependencies);
    this.typeService = dependencies.typeService || new DocumentTypeService();
  }

  async uploadDocument(userId, payload, file) {
    return this.uploadService.uploadDocument(userId, payload, file);
  }

  async uploadSelfie(userId, file) {
    return this.uploadService.uploadSelfie(userId, file);
  }

  async listDocuments(userId) {
    return this.uploadService.listDocuments(userId);
  }

  async getDocument(userId, documentId) {
    return this.uploadService.getDocument(userId, documentId);
  }

  async deleteDocument(userId, documentId) {
    return this.uploadService.deleteDocument(userId, documentId);
  }

  async getDocumentSignedUrl(userId, documentId, ttlSeconds) {
    return this.uploadService.getDocumentSignedUrl(userId, documentId, ttlSeconds);
  }

  async listDocumentTypes(filters) {
    return this.typeService.list(filters);
  }

  async listDocumentTypesForCountry(countryCode) {
    return this.typeService.listForCountry(countryCode);
  }
}

export default DocumentService;