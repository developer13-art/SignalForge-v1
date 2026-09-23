/**
 * Provider DNA Controller
 *
 * @module signalforge/server/modules/provider-dna/controller
 */

import { DnaService } from './dna.service.js';
import { RuleController } from './rules/rule.controller.js';
import { ProfileController } from './profile/profile.controller.js';
import { validateCreateDnaPayload, validateRuleCreatePayload, validateLearningPayload } from './dna.validator.js';
import { validateDnaTestPayload } from './rules/rule-validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class DnaController {
  constructor(service = null) {
    this.service = service || new DnaService();
    this.ruleController = new RuleController();
    this.profileController = new ProfileController();
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

  getDna = async (req, res, next) => {
    try {
      const dna = await this.service.getDnaByProviderId(req.params.providerId);
      res.status(200).json({ dna });
    } catch (error) {
      next(error);
    }
  };

  ensureDna = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateDnaPayload, req.body);
      const dna = await this.service.ensureDna(req.body.providerId, req.body);
      res.status(201).json({ dna });
    } catch (error) {
      next(error);
    }
  };

  updateDna = async (req, res, next) => {
    try {
      const dna = await this.service.updateDna(req.params.providerId, req.body);
      res.status(200).json({ dna });
    } catch (error) {
      next(error);
    }
  };

  tryFastPath = async (req, res, next) => {
    try {
      const result = await this.service.tryFastPath(req.params.providerId, {
        id: req.body.messageId,
        text: req.body.text,
      }, req.body);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  learnFromHistory = async (req, res, next) => {
    try {
      this.validateOrThrow(validateLearningPayload, req.body);
      const result = await this.service.learnFromHistory(
        req.params.providerId,
        req.body.messages,
        req.body.parsedSignals,
        req.body.options || {},
      );
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  applyReinforcement = async (req, res, next) => {
    try {
      const result = await this.service.applyReinforcement(req.params.providerId);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  recordOutcome = async (req, res, next) => {
    try {
      const result = await this.service.recordOutcome(
        req.params.providerId,
        req.body.ruleId,
        req.body.success === true,
      );
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  getFullProfile = async (req, res, next) => {
    return this.profileController.getFullProfile(req, res, next);
  };

  runTest = async (req, res, next) => {
    try {
      this.validateOrThrow(validateDnaTestPayload, req.body);
      const result = await this.service.runTest(
        req.params.providerId,
        req.body.text,
        { userId: req.user?.id || null },
      );
      res.status(200).json({ test: result });
    } catch (error) {
      next(error);
    }
  };

  listTests = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const tests = await this.service.listTests(req.params.providerId, limit);
      res.status(200).json({ tests });
    } catch (error) {
      next(error);
    }
  };

  createVersion = async (req, res, next) => {
    try {
      const version = await this.service.createVersion(
        req.params.providerId,
        req.body.changeSummary,
        req.user?.id || null,
      );
      res.status(201).json({ version });
    } catch (error) {
      next(error);
    }
  };

  listVersions = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const versions = await this.service.listVersions(req.params.providerId, limit);
      res.status(200).json({ versions });
    } catch (error) {
      next(error);
    }
  };

  getVersion = async (req, res, next) => {
    try {
      const version = await this.service.getVersion(
        req.params.providerId,
        req.params.versionId,
      );
      res.status(200).json({ version });
    } catch (error) {
      next(error);
    }
  };

  compareVersions = async (req, res, next) => {
    try {
      const diff = await this.service.compareVersions(
        req.params.providerId,
        req.params.versionIdA,
        req.params.versionIdB,
      );
      res.status(200).json({ diff });
    } catch (error) {
      next(error);
    }
  };
}

export default DnaController;