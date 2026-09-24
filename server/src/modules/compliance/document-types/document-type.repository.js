/**
 * Document Type Repository
 *
 * Persistence layer for admin-configurable KYC document types.
 *
 * @module server/modules/compliance/document-types/document-type.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertDocumentType({
  code,
  label,
  description,
  requiredFields,
  acceptedFormats,
  maxSizeBytes,
  active,
}) {
  const { rows } = await db.query(
    `INSERT INTO kyc_document_types
       (code, label, description, required_fields, accepted_formats, max_size_bytes, active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING *`,
    [
      code,
      label,
      description || null,
      requiredFields ? JSON.stringify(requiredFields) : null,
      acceptedFormats ? JSON.stringify(acceptedFormats) : null,
      maxSizeBytes || null,
      active !== false,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findByCode({ code }) {
  const { rows } = await db.query(
    `SELECT * FROM kyc_document_types WHERE code = $1 LIMIT 1`,
    [code],
  );
  return rows[0] || null;
}

export async function findById({ documentTypeId }) {
  const { rows } = await db.query(
    `SELECT * FROM kyc_document_types WHERE id = $1 LIMIT 1`,
    [documentTypeId],
  );
  return rows[0] || null;
}

export async function listAll({ activeOnly = false } = {}) {
  const where = activeOnly ? `WHERE active = TRUE` : '';
  const { rows } = await db.query(
    `SELECT * FROM kyc_document_types ${where} ORDER BY label ASC`,
  );
  return rows;
}

export async function updateDocumentType({
  documentTypeId,
  label,
  description,
  requiredFields,
  acceptedFormats,
  maxSizeBytes,
  active,
}) {
  const { rows } = await db.query(
    `UPDATE kyc_document_types
        SET label = COALESCE($1, label),
            description = COALESCE($2, description),
            required_fields = COALESCE($3, required_fields),
            accepted_formats = COALESCE($4, accepted_formats),
            max_size_bytes = COALESCE($5, max_size_bytes),
            active = COALESCE($6, active),
            updated_at = $7
      WHERE id = $8
      RETURNING *`,
    [
      label || null,
      description || null,
      requiredFields ? JSON.stringify(requiredFields) : null,
      acceptedFormats ? JSON.stringify(acceptedFormats) : null,
      maxSizeBytes || null,
      active === undefined ? null : active,
      nowIso(),
      documentTypeId,
    ],
  );
  return rows[0] || null;
}

export async function deactivateDocumentType({ documentTypeId }) {
  const { rowCount } = await db.query(
    `UPDATE kyc_document_types
        SET active = FALSE, updated_at = $1
      WHERE id = $2`,
    [nowIso(), documentTypeId],
  );
  return rowCount > 0;
}

export async function deleteDocumentType({ documentTypeId }) {
  const { rowCount } = await db.query(
    `DELETE FROM kyc_document_types WHERE id = $1`,
    [documentTypeId],
  );
  return rowCount > 0;
}

export const documentTypeRepository = {
  insertDocumentType,
  findByCode,
  findById,
  listAll,
  updateDocumentType,
  deactivateDocumentType,
  deleteDocumentType,
};