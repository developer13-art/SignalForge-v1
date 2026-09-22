/**
 * Duplicate Detection Service
 *
 * Detects duplicate KYC document submissions by comparing file hashes
 * within an application and across the platform.
 *
 * @module signalforge/server/modules/kyc/documents/duplicate-detection
 */

import { DocumentRepository } from './document.repository.js';
import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { KycDuplicateDocumentError } from '../kyc.errors.js';

export class DuplicateDetectionService {
  constructor(repository = null) {
    this.repository = repository || new DocumentRepository();
  }

  async checkWithinApplication(applicationId, documentType, fileHash) {
    const existing = await this.repository.findByTypeAndHash(
      applicationId,
      documentType,
      fileHash,
    );
    if (existing) {
      throw new KycDuplicateDocumentError();
    }
    return { duplicate: false };
  }

  async checkPlatformWide(fileHash, excludeApplicationId = null) {
    const db = getDatabase();
    const params = [fileHash];
    let query = `SELECT application_id FROM kyc_documents WHERE encrypted_number = $1`;
    if (excludeApplicationId) {
      query += ` AND application_id != $2`;
      params.push(excludeApplicationId);
    }
    query += ` LIMIT 1`;

    const result = await db.query(query, params);
    if (result.rowCount > 0) {
      return {
        duplicate: true,
        otherApplicationId: result.rows[0].application_id,
      };
    }
    return { duplicate: false };
  }

  async assertNotDuplicate(applicationId, documentType, fileHash) {
    await this.checkWithinApplication(applicationId, documentType, fileHash);
    const platformWide = await this.checkPlatformWide(fileHash, applicationId);
    if (platformWide.duplicate) {
      throw new KycDuplicateDocumentError(
        'This document has already been uploaded to another KYC application',
      );
    }
    return { duplicate: false };
  }
}

export default DuplicateDetectionService;