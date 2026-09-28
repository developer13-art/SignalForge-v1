/**
 * Certification Controller
 *
 * @module signalforge/server/modules/providers/certification/controller
 */

import { CertificationService } from './service.js';
import {
  validateCertificationStartPayload,
  validateCertificationDecisionPayload,
} from '../provider.validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class CertificationController {
  constructor(service = null) {
    this.service = service || new CertificationService();
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

  startCertification = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCertificationStartPayload, req.body);
      const certification = await this.service.startCertification(
        req.params.providerId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ certification });
    } catch (error) {
      next(error);
    }
  };

  getCertification = async (req, res, next) => {
    try {
      const certification = await this.service.getCertificationById(
        req.params.certificationId,
      );
      res.status(200).json({ certification });
    } catch (error) {
      next(error);
    }
  };

  getLatestCertification = async (req, res, next) => {
    try {
      const certification = await this.service.getLatestCertification(
        req.params.providerId,
      );
      res.status(200).json({ certification });
    } catch (error) {
      next(error);
    }
  };

  listCertifications = async (req, res, next) => {
    try {
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listCertifications(
        req.params.providerId,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  revokeCertification = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCertificationDecisionPayload, {
        ...req.body,
        decision: 'REVOKE',
      });
      const certification = await this.service.revokeCertification(
        req.params.certificationId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json({ certification });
    } catch (error) {
      next(error);
    }
  };

  expireDue = async (req, res, next) => {
    try {
      const result = await this.service.expireDueCertifications();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default CertificationController;