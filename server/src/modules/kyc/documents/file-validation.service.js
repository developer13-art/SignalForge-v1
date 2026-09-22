/**
 * File Validation Service
 *
 * Validates KYC document and selfie files: size, mime type, and
 * basic header inspection for images and PDFs.
 *
 * @module signalforge/server/modules/kyc/documents/file-validation
 */

import crypto from 'node:crypto';

import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_SELFIE_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_SELFIE_MAX_FILE_SIZE_MB,
} from '../kyc.constants.js';
import {
  KycDocumentTooLargeError,
  KycInvalidDocumentFormatError,
} from '../kyc.errors.js';

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP_RIFF = Buffer.from([0x52, 0x49, 0x46, 0x46]); // RIFF
const WEBP_TAG = Buffer.from([0x57, 0x45, 0x42, 0x50]); // WEBP

export class FileValidationService {
  detectMimeType(buffer) {
    if (!buffer || buffer.length < 4) {
      return null;
    }
    if (buffer.slice(0, 4).equals(PDF_MAGIC)) {
      return 'application/pdf';
    }
    if (buffer.slice(0, 3).equals(JPEG_MAGIC)) {
      return 'image/jpeg';
    }
    if (buffer.slice(0, 8).equals(PNG_MAGIC)) {
      return 'image/png';
    }
    if (buffer.slice(0, 4).equals(WEBP_RIFF) && buffer.length >= 12 && buffer.slice(8, 12).equals(WEBP_TAG)) {
      return 'image/webp';
    }
    return null;
  }

  hashBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  validateDocumentFile(file) {
    if (!file) {
      throw new KycInvalidDocumentFormatError('Document file is required');
    }

    const maxBytes = DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size && file.size > maxBytes) {
      throw new KycDocumentTooLargeError(
        `Document must not exceed ${DEFAULT_MAX_FILE_SIZE_MB} MB`,
        { maxBytes, actualBytes: file.size },
      );
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new KycInvalidDocumentFormatError(
        `Document format must be one of: ${ALLOWED_DOCUMENT_MIME_TYPES.join(', ')}`,
      );
    }

    const detected = this.detectMimeType(file.buffer);
    if (!detected) {
      throw new KycInvalidDocumentFormatError('File content does not match a supported format');
    }

    if (detected !== file.mimetype && !(detected === 'image/jpeg' && file.mimetype === 'image/jpg')) {
      throw new KycInvalidDocumentFormatError('File content does not match declared mime type');
    }

    return {
      valid: true,
      mimeType: detected,
      size: file.size,
      hash: this.hashBuffer(file.buffer),
    };
  }

  validateSelfieFile(file) {
    if (!file) {
      throw new KycInvalidDocumentFormatError('Selfie file is required');
    }

    const maxBytes = DEFAULT_SELFIE_MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size && file.size > maxBytes) {
      throw new KycDocumentTooLargeError(
        `Selfie must not exceed ${DEFAULT_SELFIE_MAX_FILE_SIZE_MB} MB`,
        { maxBytes, actualBytes: file.size },
      );
    }

    if (!ALLOWED_SELFIE_MIME_TYPES.includes(file.mimetype)) {
      throw new KycInvalidDocumentFormatError(
        `Selfie format must be one of: ${ALLOWED_SELFIE_MIME_TYPES.join(', ')}`,
      );
    }

    const detected = this.detectMimeType(file.buffer);
    if (!detected || !ALLOWED_SELFIE_MIME_TYPES.includes(detected)) {
      throw new KycInvalidDocumentFormatError('Selfie content does not match a supported format');
    }

    return {
      valid: true,
      mimeType: detected,
      size: file.size,
      hash: this.hashBuffer(file.buffer),
    };
  }
}

export default FileValidationService;