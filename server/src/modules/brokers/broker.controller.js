/**
 * Broker Controller
 *
 * @module signalforge/server/modules/brokers/controller
 */

import { BrokerService } from './broker.service.js';
import { AccountController } from './accounts/account.controller.js';
import { validateCreateBrokerPayload, validateUpdateBrokerPayload } from './broker.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class BrokerController {
  constructor(service = null) {
    this.service = service || new BrokerService();
    this.accountController = new AccountController(this.service.accounts);
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

  listBrokers = async (req, res, next) => {
    try {
      const filters = {
        platform: req.query.platform,
        active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
      };
      const brokers = await this.service.listBrokers(filters);
      res.status(200).json({ brokers });
    } catch (error) {
      next(error);
    }
  };

  getBroker = async (req, res, next) => {
    try {
      const broker = await this.service.getBrokerById(req.params.brokerId);
      res.status(200).json({ broker });
    } catch (error) {
      next(error);
    }
  };

  createBroker = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateBrokerPayload, req.body);
      const broker = await this.service.createBroker(req.body);
      res.status(201).json({ broker });
    } catch (error) {
      next(error);
    }
  };

  updateBroker = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpdateBrokerPayload, req.body);
      const broker = await this.service.updateBroker(req.params.brokerId, req.body);
      res.status(200).json({ broker });
    } catch (error) {
      next(error);
    }
  };

  deleteBroker = async (req, res, next) => {
    try {
      const result = await this.service.deleteBroker(req.params.brokerId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBrokerSpec = async (req, res, next) => {
    try {
      const spec = this.service.getBrokerSpec(req.params.server);
      res.status(200).json({ spec });
    } catch (error) {
      next(error);
    }
  };

  resolveSymbol = async (req, res, next) => {
    try {
      const canonical = this.service.resolveSymbol(req.params.platform, req.params.symbol);
      res.status(200).json({ canonical });
    } catch (error) {
      next(error);
    }
  };

  getSymbolCandidates = async (req, res, next) => {
    try {
      const candidates = this.service.getSymbolCandidates(
        req.params.platform,
        req.params.symbol,
      );
      res.status(200).json({ candidates });
    } catch (error) {
      next(error);
    }
  };

  listConnectionLogs = async (req, res, next) => {
    try {
      const result = await this.service.listConnectionLogs(req.params.accountId, {
        limit: req.query.limit,
        offset: req.query.offset,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default BrokerController;