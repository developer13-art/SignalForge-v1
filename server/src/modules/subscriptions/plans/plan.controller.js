/**
 * Plan Controller
 *
 * @module signalforge/server/modules/subscriptions/plans/controller
 */

import { PlanService } from './service.js';
import { validateCreatePlan, validateUpdatePlan } from './validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class PlanController {
  constructor(service = null) {
    this.service = service || new PlanService();
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

  createPlan = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreatePlan, req.body);
      const plan = await this.service.create(req.body);
      res.status(201).json({ plan });
    } catch (error) {
      next(error);
    }
  };

  listPlans = async (req, res, next) => {
    try {
      const filters = {
        isActive:
          req.query.isActive !== undefined ? req.query.isActive === 'true' : true,
        billingInterval: req.query.billingInterval,
      };
      const plans = await this.service.list(filters);
      res.status(200).json({ plans });
    } catch (error) {
      next(error);
    }
  };

  getPlan = async (req, res, next) => {
    try {
      const plan = await this.service.getById(req.params.planId);
      res.status(200).json({ plan });
    } catch (error) {
      next(error);
    }
  };

  getPlanByCode = async (req, res, next) => {
    try {
      const plan = await this.service.getByCode(req.params.code);
      res.status(200).json({ plan });
    } catch (error) {
      next(error);
    }
  };

  updatePlan = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpdatePlan, req.body);
      const plan = await this.service.update(req.params.planId, req.body);
      res.status(200).json({ plan });
    } catch (error) {
      next(error);
    }
  };

  deletePlan = async (req, res, next) => {
    try {
      const result = await this.service.delete(req.params.planId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default PlanController;