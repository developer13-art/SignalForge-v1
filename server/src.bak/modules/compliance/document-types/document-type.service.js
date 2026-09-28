/**
 * Document Type Service
 *
 * Business logic for the admin-configurable list of KYC document
 * types. Document types are never hardcoded; they are read from the
 * database so compliance can adapt without deployments.
 *
 * @module server/modules/compliance/document-types/document-type.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import * as repository from './document-type.repository';

const DEFAULT_ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'application/pdf'];
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

function normalizeCode(code) {
  return String(code).trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
}

export async function createDocumentType({
  code,
  label,
  description,
  requiredFields,
  acceptedFormats,
  maxSizeBytes,
  active,
}) {
  if (!code || !label) {
    throw new AppError('code and label are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalizedCode = normalizeCode(code);

  const existing = await repository.findByCode({ code: normalizedCode });

  if (existing) {
    throw new AppError('A document type with this code already exists', ERROR_CODES.CONFLICT, 409);
  }

  const record = await repository.insertDocumentType({
    code: normalizedCode,
    label,
    description,
    requiredFields,
    acceptedFormats: acceptedFormats || DEFAULT_ACCEPTED_FORMATS,
    maxSizeBytes: maxSizeBytes || DEFAULT_MAX_SIZE_BYTES,
    active,
  });

  logger.info({ documentTypeId: record.id, code: record.code }, 'Document type created');

  return {
    documentTypeId: record.id,
    code: record.code,
    label: record.label,
    description: record.description,
    requiredFields: record.required_fields ? JSON.parse(record.required_fields) : null,
    acceptedFormats: record.accepted_formats ? JSON.parse(record.accepted_formats) : DEFAULT_ACCEPTED_FORMATS,
    maxSizeBytes: record.max_size_bytes || DEFAULT_MAX_SIZE_BYTES,
    active: record.active,
  };
}

export async function listDocumentTypes({ activeOnly = true } = {}) {
  const rows = await repository.listAll({ activeOnly });

  return rows.map((row) => ({
    documentTypeId: row.id,
    code: row.code,
    label: row.label,
    description: row.description,
    requiredFields: row.required_fields ? JSON.parse(row.required_fields) : null,
    acceptedFormats: row.accepted_formats ? JSON.parse(row.accepted_formats) : DEFAULT_ACCEPTED_FORMATS,
    maxSizeBytes: row.max_size_bytes || DEFAULT_MAX_SIZE_BYTES,
    active: row.active,
  }));
}

export async function getDocumentTypeById({ documentTypeId }) {
  if (!documentTypeId) {
    throw new AppError('documentTypeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findById({ documentTypeId });

  if (!record) {
    throw new AppError('Document type not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    documentTypeId: record.id,
    code: record.code,
    label: record.label,
    description: record.description,
    requiredFields: record.required_fields ? JSON.parse(record.required_fields) : null,
    acceptedFormats: record.accepted_formats ? JSON.parse(record.accepted_formats) : DEFAULT_ACCEPTED_FORMATS,
    maxSizeBytes: record.max_size_bytes || DEFAULT_MAX_SIZE_BYTES,
    active: record.active,
  };
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
  if (!documentTypeId) {
    throw new AppError('documentTypeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.updateDocumentType({
    documentTypeId,
    label,
    description,
    requiredFields,
    acceptedFormats,
    maxSizeBytes,
    active,
  });

  if (!record) {
    throw new AppError('Document type not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    documentTypeId: record.id,
    code: record.code,
    label: record.label,
    description: record.description,
    requiredFields: record.required_fields ? JSON.parse(record.required_fields) : null,
    acceptedFormats: record.accepted_formats ? JSON.parse(record.accepted_formats) : DEFAULT_ACCEPTED_FORMATS,
    maxSizeBytes: record.max_size_bytes || DEFAULT_MAX_SIZE_BYTES,
    active: record.active,
  };
}

export async function deactivateDocumentType({ documentTypeId }) {
  if (!documentTypeId) {
    throw new AppError('documentTypeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deactivated = await repository.deactivateDocumentType({ documentTypeId });

  if (!deactivated) {
    throw new AppError('Document type not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deactivated: true };
}

export async function deleteDocumentType({ documentTypeId }) {
  if (!documentTypeId) {
    throw new AppError('documentTypeId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteDocumentType({ documentTypeId });

  if (!deleted) {
    throw new AppError('Document type not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deleted: true };
}

export const documentTypeService = {
  createDocumentType,
  listDocumentTypes,
  getDocumentTypeById,
  updateDocumentType,
  deactivateDocumentType,
  deleteDocumentType,
};