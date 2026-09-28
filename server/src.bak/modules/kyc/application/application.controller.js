/**
 * Application Controller
 *
 * @module signalforge/server/modules/kyc/application/controller
 */

import { ApplicationService } from './application.service.js';
import { validatePersonalInfoPayload } from '../kyc.validator.js';
import { validateSubmitApplicationPayload, validateResubmitApplicationPayload } from './application.validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class ApplicationController {
  constructor(service = null) {
    this.service = service || new ApplicationService();
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

  getOrCreate = async (req, res, next) => {
    try {
      const application = await this.service.getOrCreateForUser(req.user.id);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  getMyApplication = async (req, res, next) => {
    try {
      const application = await this.service.getByUserId(req.user.id);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  getApplication = async (req, res, next) => {
    try {
      const application = await this.service.getById(req.params.applicationId);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  updatePersonalInfo = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePersonalInfoPayload, req.body);
      const application = await this.service.updatePersonalInfo(req.user.id, req.body);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  submit = async (req, res, next) => {
    try {
      this.validateOrThrow(validateSubmitApplicationPayload, req.body);
      const application = await this.service.submit(req.user.id);
      res.status(200).json({
        message: 'Your KYC application has been submitted for review.',
        application,
      });
    } catch (error) {
      next(error);
    }
  };

  resubmit = async (req, res, next) => {
    try {
      this.validateOrThrow(validateResubmitApplicationPayload, req.body);
      const application = await this.service.resubmit(req.user.id, req.body);
      res.status(200).json({
        message: 'Your KYC application has been resubmitted for review.',
        application,
      });
    } catch (error) {
      next(error);
    }
  };

  listApplications = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        userId: req.query.userId,
        provider: req.query.provider,
        reviewerId: req.query.reviewerId,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.list(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req, res, next) => {
    try {
      const counts = await this.service.countByStatus();
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };
}

export default ApplicationController;