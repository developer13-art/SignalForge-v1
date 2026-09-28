/**
 * Quality Check Service
 *
 * Orchestrates all pre-submission quality checks on KYC documents.
 *
 * @module signalforge/server/modules/kyc/documents/quality-check
 */

import { ImageQualityService } from './image-quality.service.js';
import { FileValidationService } from './file-validation.service.js';
import { QUALITY_CHECK_RESULTS } from '../kyc.constants.js';
import { KycDocumentQualityError } from '../kyc.errors.js';

export class QualityCheckService {
  constructor() {
    this.imageQuality = new ImageQualityService();
    this.fileValidation = new FileValidationService();
  }

  async checkDocument(file, options = {}) {
    const fileCheck = this.fileValidation.validateDocumentFile(file);
    const details = {
      fileHash: fileCheck.hash,
      mimeType: fileCheck.mimeType,
      size: fileCheck.size,
    };

    if (fileCheck.mimeType === 'application/pdf') {
      return {
        result: QUALITY_CHECK_RESULTS.PASSED,
        details,
      };
    }

    const quality = this.imageQuality.check(file.buffer, fileCheck.mimeType, options);
    const combined = { ...details, ...quality.details };

    if (quality.result === QUALITY_CHECK_RESULTS.FAILED) {
      if (options.strict === true) {
        throw new KycDocumentQualityError(quality.reason, combined);
      }
      return { result: quality.result, reason: quality.reason, details: combined };
    }

    return {
      result: quality.result,
      warnings: quality.warnings || [],
      details: combined,
    };
  }

  async checkSelfie(file, options = {}) {
    const fileCheck = this.fileValidation.validateSelfieFile(file);
    const quality = this.imageQuality.check(file.buffer, fileCheck.mimeType, options);

    const combined = {
      fileHash: fileCheck.hash,
      mimeType: fileCheck.mimeType,
      size: fileCheck.size,
      ...quality.details,
    };

    if (quality.result === QUALITY_CHECK_RESULTS.FAILED) {
      if (options.strict === true) {
        throw new KycDocumentQualityError(quality.reason, combined);
      }
      return { result: quality.result, reason: quality.reason, details: combined };
    }

    return {
      result: quality.result,
      warnings: quality.warnings || [],
      details: combined,
    };
  }
}

export default QualityCheckService;