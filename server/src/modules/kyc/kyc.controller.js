/**
 * KYC Controller (facade)
 *
 * @module signalforge/server/modules/kyc/controller
 */
const { KycService } = require('./kyc.service.js');
const { ApplicationController } = require('./application/application.controller.js');
const { DocumentController } = require('./documents/document.controller.js');
const { VerificationController } = require('./verification/verification.controller.js');
const { validateReviewDecisionPayload } = require('./kyc.validator.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
class KycController {
  constructor(service = null) {
    this.service = service || new KycService();
    this.applicationController = new ApplicationController();
    this.documentController = new DocumentController();
    this.verificationController = new VerificationController();
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  getStatus = async (req, res, next) => {
    try {
      const status = await this.service.getStatus(req.user.id);
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  };

  getOrCreateApplication = async (req, res, next) => {
    try {
      const application = await this.service.getOrCreateApplication(req.user.id);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  getMyApplication = async (req, res, next) => {
    try {
      const application = await this.service.getApplication(req.user.id);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  getApplication = async (req, res, next) => {
    try {
      const application = await this.service.getApplicationById(req.params.applicationId);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  updatePersonalInfo = async (req, res, next) => {
    return this.applicationController.updatePersonalInfo(req, res, next);
  };

  updateDocumentType = async (req, res, next) => {
    return this.applicationController.updateDocumentType(req, res, next);
  };

    updateDocumentType = async (req, res, next) => {
    try {
      const { applicationId } = req.params;
      const { documentType } = req.body;
      if (!documentType) {
        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: 'documentType is required',
          },
        });
      }
      const application = await this.service.updateDocumentType(
        req.user.id,
        applicationId,
        documentType,
      );
      return res.status(200).json({ application });
    } catch (error) {
      return next(error);
    }
  };

  submitApplication = async (req, res, next) => {
    return this.applicationController.submit(req, res, next);
  };

  resubmitApplication = async (req, res, next) => {
    return this.applicationController.resubmit(req, res, next);
  };

  uploadDocument = async (req, res, next) => {
    return this.documentController.uploadDocument(req, res, next);
  };

  uploadSelfie = async (req, res, next) => {
    return this.documentController.uploadSelfie(req, res, next);
  };

  listDocuments = async (req, res, next) => {
    return this.documentController.listDocuments(req, res, next);
  };

  getDocument = async (req, res, next) => {
    return this.documentController.getDocument(req, res, next);
  };

  getDocumentUrl = async (req, res, next) => {
    return this.documentController.getDocumentUrl(req, res, next);
  };

  deleteDocument = async (req, res, next) => {
    return this.documentController.deleteDocument(req, res, next);
  };

  listDocumentTypes = async (req, res, next) => {
    return this.documentController.listDocumentTypes(req, res, next);
  };

  startVerification = async (req, res, next) => {
    return this.verificationController.startVerification(req, res, next);
  };

  getLatestVerification = async (req, res, next) => {
    return this.verificationController.getLatestVerification(req, res, next);
  };

  listVerifications = async (req, res, next) => {
    return this.verificationController.listVerifications(req, res, next);
  };

  approve = async (req, res, next) => {
    try {
      this.validateOrThrow(validateReviewDecisionPayload, { ...req.body, decision: 'APPROVE' });
      const result = await this.service.approve(
        req.params.applicationId,
        req.user.id,
        req.body.notes,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  reject = async (req, res, next) => {
    try {
      this.validateOrThrow(validateReviewDecisionPayload, { ...req.body, decision: 'REJECT' });
      const result = await this.service.reject(
        req.params.applicationId,
        req.user.id,
        req.body.reason,
        req.body.notes,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  requestResubmission = async (req, res, next) => {
    try {
      this.validateOrThrow(validateReviewDecisionPayload, {
        ...req.body,
        decision: 'REQUEST_RESUBMISSION',
      });
      const result = await this.service.requestResubmission(
        req.params.applicationId,
        req.user.id,
        req.body.reason,
        req.body.notes,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listApplications = async (req, res, next) => {
    return this.applicationController.listApplications(req, res, next);
  };

  getStats = async (req, res, next) => {
    return this.applicationController.getStats(req, res, next);
  };

  listAuditLogs = async (req, res, next) => {
    try {
      const logs = await this.service.listAuditLogs(req.params.applicationId);
      res.status(200).json({ logs });
    } catch (error) {
      next(error);
    }
  };

  triggerReverification = async (req, res, next) => {
    try {
      const result = await this.service.triggerReverification(
        req.params.userId,
        req.body.reason || 'Admin triggered reverification',
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  handleProviderWebhook = async (req, res, next) => {
    try {
      const providerName = req.params.provider;
      const result = await this.service.handleProviderWebhook(providerName, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
module.exports = KycController;
module.exports.KycController = KycController;
