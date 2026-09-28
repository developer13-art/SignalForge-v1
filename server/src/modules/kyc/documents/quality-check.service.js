/**
 * Quality Check Service
 *
 * Orchestrates all pre-submission quality checks on KYC documents.
 *
 * @module signalforge/server/modules/kyc/documents/quality-check
 */
const { ImageQualityService } = require('./image-quality.service.js');
const { FileValidationService } = require('./file-validation.service.js');
const { QUALITY_CHECK_RESULTS } = require('../kyc.constants.js');
const { KycDocumentQualityError } = require('../kyc.errors.js');
class QualityCheckService {
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
module.exports = QualityCheckService;
module.exports.QualityCheckService = QualityCheckService;
