/**
 * Automation Controller
 *
 * @module signalforge/server/modules/automation/controller
 */

import { AutomationService } from './automation.service.js';
import {
  validateRuleCreatePayload,
  validateRuleUpdatePayload,
  validateEvaluatePayload,
} from './automation.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class AutomationController {
  constructor(service = null) {
    this.service = service || new AutomationService();
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

  createRule = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRuleCreatePayload, req.body);
      const rule = await this.service.createRule(req.user.id, req.body);
      res.status(201).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  listRules = async (req, res, next) => {
    try {
      const filters = {
        scope: req.query.scope,
        enabled: req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined,
        providerId: req.query.providerId,
        symbol: req.query.symbol,
      };
      const rules = await this.service.listRules(req.user.id, filters);
      res.status(200).json({ rules });
    } catch (error) {
      next(error);
    }
  };

  getRule = async (req, res, next) => {
    try {
      const rule = await this.service.getRuleById(req.user.id, req.params.ruleId);
      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  updateRule = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRuleUpdatePayload, req.body);
      const rule = await this.service.updateRule(req.user.id, req.params.ruleId, req.body);
      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  deleteRule = async (req, res, next) => {
    try {
      const result = await this.service.deleteRule(req.user.id, req.params.ruleId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  enableRule = async (req, res, next) => {
    try {
      const rule = await this.service.enableRule(req.user.id, req.params.ruleId);
      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  disableRule = async (req, res, next) => {
    try {
      const rule = await this.service.disableRule(req.user.id, req.params.ruleId);
      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  };

  evaluate = async (req, res, next) => {
    try {
      this.validateOrThrow(validateEvaluatePayload, req.body);
      const result = await this.service.evaluateRules(
        req.user.id,
        req.body.context,
        req.body.options || {},
      );
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  testRule = async (req, res, next) => {
    try {
      const result = await this.service.testRule(req.user.id, req.body);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  listTriggersForRule = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const triggers = await this.service.listTriggersForRule(
        req.user.id,
        req.params.ruleId,
        limit,
      );
      res.status(200).json({ triggers });
    } catch (error) {
      next(error);
    }
  };

  listTriggers = async (req, res, next) => {
    try {
      const filters = {
        success: req.query.success !== undefined ? req.query.success === 'true' : undefined,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listTriggers(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default AutomationController;