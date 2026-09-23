/**
 * DNA Rule Controller
 *
 * @module signalforge/server/modules/provider-dna/rules/controller
 */

import { RuleService } from './rule.service.js';
import { AbbreviationService } from './abbreviation.service.js';
import { validateRuleCreatePayload, validateRuleUpdatePayload } from './rule-validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class RuleController {
  constructor(service = null, abbreviationService = null) {
    this.service = service || new RuleService();
    this.abbreviations = abbreviationService || new AbbreviationService();
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

  create = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRuleCreatePayload, req.body);
      const rule = await this.service.create(req.params.providerId, req.body);
      res.status(201).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const filters = {
        ruleType: req.query.ruleType,
        enabled: req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined,
      };
      const rules = await this.service.list(req.params.providerId, filters);
      res.status(200).json({ rules });
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const rule = await this.service.getById(req.params.providerId, req.params.ruleId);
      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRuleUpdatePayload, req.body);
      const rule = await this.service.update(
        req.params.providerId,
        req.params.ruleId,
        req.body,
      );
      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const result = await this.service.delete(req.params.providerId, req.params.ruleId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  match = async (req, res, next) => {
    try {
      const matches = await this.service.matchRules(
        req.params.providerId,
        req.body.text || '',
      );
      res.status(200).json({ matches });
    } catch (error) {
      next(error);
    }
  };

  listAbbreviations = async (req, res, next) => {
    try {
      const abbreviations = await this.abbreviations.list(req.params.providerId);
      res.status(200).json({ abbreviations });
    } catch (error) {
      next(error);
    }
  };

  addAbbreviation = async (req, res, next) => {
    try {
      const abbreviation = await this.abbreviations.add(
        req.params.providerId,
        req.body.phrase,
        req.body.intent,
        req.body,
      );
      res.status(201).json({ abbreviation });
    } catch (error) {
      next(error);
    }
  };
}

export default RuleController;