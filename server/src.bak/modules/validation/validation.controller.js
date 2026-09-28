/**
 * Signal Validation Controller
 *
 * @module signalforge/server/modules/validation/controller
 */

import { ValidationService } from './validation.service.js';

export class ValidationController {
  constructor(service = null) {
    this.service = service || new ValidationService();
  }

  validate = async (req, res, next) => {
    try {
      const result = await this.service.validate(req.body.signal, req.body.options || {});
      res.status(200).json({ validation: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const validation = await this.service.getById(req.params.validationId);
      res.status(200).json({ validation });
    } catch (error) {
      next(error);
    }
  };

  getLatestBySignal = async (req, res, next) => {
    try {
      const validation = await this.service.getLatestBySignal(req.params.signalId);
      res.status(200).json({ validation });
    } catch (error) {
      next(error);
    }
  };

  listBySignal = async (req, res, next) => {
    try {
      const validations = await this.service.listBySignal(req.params.signalId);
      res.status(200).json({ validations });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const filters = {
        result: req.query.result,
        providerId: req.query.providerId,
        sourceId: req.query.sourceId,
        since: req.query.since,
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

  stats = async (req, res, next) => {
    try {
      const filters = { since: req.query.since };
      const stats = await this.service.stats(filters);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };
}

export default ValidationController;