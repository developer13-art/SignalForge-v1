/**
 * KYC Document Repository
 *
 * @module signalforge/server/modules/kyc/documents/repository
 */

import { KycRepository } from '../kyc.repository.js';

export class DocumentRepository {
  constructor(db = null) {
    this.kycRepository = new KycRepository(db);
  }

  async create(data) {
    return this.kycRepository.createDocument(data);
  }

  async findById(documentId) {
    return this.kycRepository.findDocumentById(documentId);
  }

  async listByApplication(applicationId) {
    return this.kycRepository.listDocumentsByApplication(applicationId);
  }

  async findByTypeAndHash(applicationId, documentType, fileHash) {
    return this.kycRepository.findDocumentByTypeAndHash(applicationId, documentType, fileHash);
  }

  async delete(documentId) {
    return this.kycRepository.deleteDocument(documentId);
  }

  async createSelfie(data) {
    return this.kycRepository.createSelfie(data);
  }

  async findSelfie(applicationId) {
    return this.kycRepository.findSelfieByApplication(applicationId);
  }

  async deleteSelfie(applicationId) {
    return this.kycRepository.deleteSelfieByApplication(applicationId);
  }
}

export default DocumentRepository;