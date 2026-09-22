/**
 * KYC Repository
 *
 * Provides direct database access for KYC-related tables:
 * kyc_applications, kyc_documents, kyc_verifications,
 * kyc_document_types, kyc_audit_logs.
 *
 * @module signalforge/server/modules/kyc/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class KycRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findApplicationByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, status, provider, provider_reference,
              personal_info, document_type, reviewer_id, rejection_reason,
              review_notes, submitted_at, reviewed_at, verified_at, expires_at,
              created_at, updated_at
         FROM kyc_applications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findActiveApplicationByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, status, provider, provider_reference,
              personal_info, document_type, reviewer_id, rejection_reason,
              review_notes, submitted_at, reviewed_at, verified_at, expires_at,
              created_at, updated_at
         FROM kyc_applications
        WHERE user_id = $1
          AND status NOT IN ('VERIFIED', 'REJECTED', 'EXPIRED', 'SUSPENDED')
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findApplicationById(applicationId) {
    const result = await this.db.query(
      `SELECT id, user_id, status, provider, provider_reference,
              personal_info, document_type, reviewer_id, rejection_reason,
              review_notes, submitted_at, reviewed_at, verified_at, expires_at,
              created_at, updated_at
         FROM kyc_applications
        WHERE id = $1
        LIMIT 1`,
      [applicationId],
    );
    return result.rows[0] || null;
  }

  async createApplication(data) {
    const result = await this.db.query(
      `INSERT INTO kyc_applications (
         user_id, status, provider, personal_info, document_type, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, user_id, status, provider, personal_info, document_type, created_at`,
      [
        data.userId,
        data.status || 'PENDING',
        data.provider || null,
        data.personalInfo ? JSON.stringify(data.personalInfo) : null,
        data.documentType || null,
      ],
    );
    return result.rows[0];
  }

  async updateApplication(applicationId, data) {
    const fields = [];
    const values = [applicationId];
    let index = 2;

    const mapping = {
      status: 'status',
      provider: 'provider',
      providerReference: 'provider_reference',
      documentType: 'document_type',
      reviewerId: 'reviewer_id',
      rejectionReason: 'rejection_reason',
      reviewNotes: 'review_notes',
      submittedAt: 'submitted_at',
      reviewedAt: 'reviewed_at',
      verifiedAt: 'verified_at',
      expiresAt: 'expires_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.personalInfo !== undefined) {
      fields.push(`personal_info = $${index++}`);
      values.push(data.personalInfo ? JSON.stringify(data.personalInfo) : null);
    }

    if (fields.length === 0) {
      return this.findApplicationById(applicationId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE kyc_applications
          SET ${fields.join(', ')}
        WHERE id = $1`,
      values,
    );

    return this.findApplicationById(applicationId);
  }

  async listApplications(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.provider) {
      conditions.push(`provider = $${index++}`);
      values.push(filters.provider);
    }

    if (filters.reviewerId) {
      conditions.push(`reviewer_id = $${index++}`);
      values.push(filters.reviewerId);
    }

    if (filters.submittedAfter) {
      conditions.push(`submitted_at >= $${index++}`);
      values.push(filters.submittedAfter);
    }

    if (filters.submittedBefore) {
      conditions.push(`submitted_at <= $${index++}`);
      values.push(filters.submittedBefore);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM kyc_applications ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, status, provider, provider_reference,
              personal_info, document_type, reviewer_id, rejection_reason,
              review_notes, submitted_at, reviewed_at, verified_at, expires_at,
              created_at, updated_at
         FROM kyc_applications
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { applications: result.rows, total, limit, offset };
  }

  async countByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM kyc_applications
        GROUP BY status`,
    );
    return result.rows;
  }

  async findExpiredApplications(before = null) {
    const result = await this.db.query(
      `SELECT id, user_id, expires_at
         FROM kyc_applications
        WHERE status = 'VERIFIED'
          AND expires_at IS NOT NULL
          AND expires_at < COALESCE($1, NOW())`,
      [before],
    );
    return result.rows;
  }

  async createDocument(data) {
    const result = await this.db.query(
      `INSERT INTO kyc_documents (
         application_id, user_id, document_type, storage_key,
         mime_type, size_bytes, encrypted_number, quality_check_result,
         quality_check_details, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, application_id, document_type, storage_key, mime_type,
                 size_bytes, quality_check_result, created_at`,
      [
        data.applicationId,
        data.userId,
        data.documentType,
        data.storageKey,
        data.mimeType,
        data.sizeBytes,
        data.encryptedNumber || null,
        data.qualityCheckResult || null,
        data.qualityCheckDetails ? JSON.stringify(data.qualityCheckDetails) : null,
      ],
    );
    return result.rows[0];
  }

  async findDocumentById(documentId) {
    const result = await this.db.query(
      `SELECT id, application_id, user_id, document_type, storage_key,
              mime_type, size_bytes, encrypted_number, quality_check_result,
              quality_check_details, created_at
         FROM kyc_documents
        WHERE id = $1
        LIMIT 1`,
      [documentId],
    );
    return result.rows[0] || null;
  }

  async listDocumentsByApplication(applicationId) {
    const result = await this.db.query(
      `SELECT id, application_id, user_id, document_type, storage_key,
              mime_type, size_bytes, quality_check_result, created_at
         FROM kyc_documents
        WHERE application_id = $1
        ORDER BY created_at ASC`,
      [applicationId],
    );
    return result.rows;
  }

  async findDocumentByTypeAndHash(applicationId, documentType, fileHash) {
    const result = await this.db.query(
      `SELECT id, application_id, user_id, document_type, storage_key, created_at
         FROM kyc_documents
        WHERE application_id = $1
          AND document_type = $2
          AND encrypted_number = $3
        LIMIT 1`,
      [applicationId, documentType, fileHash],
    );
    return result.rows[0] || null;
  }

  async deleteDocument(documentId) {
    await this.db.query('DELETE FROM kyc_documents WHERE id = $1', [documentId]);
  }

  async createSelfie(data) {
    const result = await this.db.query(
      `INSERT INTO kyc_documents (
         application_id, user_id, document_type, storage_key,
         mime_type, size_bytes, quality_check_result, created_at
       ) VALUES ($1, $2, 'SELFIE', $3, $4, $5, $6, NOW())
       RETURNING id, application_id, storage_key, created_at`,
      [
        data.applicationId,
        data.userId,
        data.storageKey,
        data.mimeType,
        data.sizeBytes,
        data.qualityCheckResult || null,
      ],
    );
    return result.rows[0];
  }

  async findSelfieByApplication(applicationId) {
    const result = await this.db.query(
      `SELECT id, application_id, storage_key, mime_type, size_bytes, created_at
         FROM kyc_documents
        WHERE application_id = $1
          AND document_type = 'SELFIE'
        ORDER BY created_at DESC
        LIMIT 1`,
      [applicationId],
    );
    return result.rows[0] || null;
  }

  async deleteSelfieByApplication(applicationId) {
    await this.db.query(
      `DELETE FROM kyc_documents WHERE application_id = $1 AND document_type = 'SELFIE'`,
      [applicationId],
    );
  }

  async createVerification(data) {
    const result = await this.db.query(
      `INSERT INTO kyc_verifications (
         application_id, user_id, provider, document_check, identity_check,
         liveness_check, name_match, dob_match, risk_score, result,
         provider_response, performed_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING id, application_id, provider, result, performed_at`,
      [
        data.applicationId,
        data.userId,
        data.provider,
        data.documentCheck ?? null,
        data.identityCheck ?? null,
        data.livenessCheck ?? null,
        data.nameMatch ?? null,
        data.dobMatch ?? null,
        data.riskScore ?? null,
        data.result,
        data.providerResponse ? JSON.stringify(data.providerResponse) : null,
      ],
    );
    return result.rows[0];
  }

  async findVerificationByApplication(applicationId) {
    const result = await this.db.query(
      `SELECT id, application_id, provider, document_check, identity_check,
              liveness_check, name_match, dob_match, risk_score, result,
              provider_response, performed_at, created_at
         FROM kyc_verifications
        WHERE application_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [applicationId],
    );
    return result.rows[0] || null;
  }

  async listVerificationsByApplication(applicationId) {
    const result = await this.db.query(
      `SELECT id, application_id, provider, result, risk_score, performed_at
         FROM kyc_verifications
        WHERE application_id = $1
        ORDER BY performed_at DESC`,
      [applicationId],
    );
    return result.rows;
  }

  async createAuditLog(data) {
    const result = await this.db.query(
      `INSERT INTO kyc_audit_logs (
         application_id, user_id, actor_id, actor_type, action,
         old_status, new_status, reason, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, created_at`,
      [
        data.applicationId,
        data.userId,
        data.actorId || null,
        data.actorType || 'SYSTEM',
        data.action,
        data.oldStatus || null,
        data.newStatus || null,
        data.reason || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listAuditLogs(applicationId) {
    const result = await this.db.query(
      `SELECT id, application_id, user_id, actor_id, actor_type, action,
              old_status, new_status, reason, metadata, created_at
         FROM kyc_audit_logs
        WHERE application_id = $1
        ORDER BY created_at DESC`,
      [applicationId],
    );
    return result.rows;
  }

  async findDocumentTypeByCode(code) {
    const result = await this.db.query(
      `SELECT id, code, label, description, enabled, country, display_order
         FROM kyc_document_types
        WHERE code = $1
        LIMIT 1`,
      [code],
    );
    return result.rows[0] || null;
  }

  async listDocumentTypes(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.enabled !== undefined) {
      conditions.push(`enabled = $${index++}`);
      values.push(filters.enabled);
    }

    if (filters.country) {
      conditions.push(`(country IS NULL OR country = $${index++})`);
      values.push(filters.country);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT id, code, label, description, enabled, country, display_order
         FROM kyc_document_types
         ${where}
         ORDER BY display_order ASC, label ASC`,
      values,
    );
    return result.rows;
  }

  async updateUserKycStatus(userId, status) {
    await this.db.query(
      `UPDATE users
          SET kyc_status = $2,
              updated_at = NOW()
        WHERE id = $1`,
      [userId, status],
    );
  }
}

export default KycRepository;