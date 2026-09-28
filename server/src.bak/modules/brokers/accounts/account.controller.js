/**
 * Broker Account Controller
 *
 * @module signalforge/server/modules/brokers/accounts/controller
 */

import { AccountService } from './account.service.js';
import {
  validateCreateAccountPayload,
  validateUpdateAccountPayload,
  validateCredentialsUpdatePayload,
} from './account.validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class AccountController {
  constructor(service = null) {
    this.service = service || new AccountService();
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

  connectAccount = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateAccountPayload, req.body);
      const account = await this.service.connectAccount(req.user.id, req.body);
      res.status(201).json({ account });
    } catch (error) {
      next(error);
    }
  };

  listAccounts = async (req, res, next) => {
    try {
      const filters = {
        platform: req.query.platform,
        status: req.query.status,
        accountType: req.query.accountType,
      };
      const accounts = await this.service.listAccounts(req.user.id, filters);
      res.status(200).json({ accounts });
    } catch (error) {
      next(error);
    }
  };

  getAccount = async (req, res, next) => {
    try {
      const account = await this.service.getAccount(req.user.id, req.params.accountId);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  };

  disconnectAccount = async (req, res, next) => {
    try {
      const result = await this.service.disconnectAccount(req.user.id, req.params.accountId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  removeAccount = async (req, res, next) => {
    try {
      const result = await this.service.removeAccount(req.user.id, req.params.accountId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateCredentials = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCredentialsUpdatePayload, req.body);
      const result = await this.service.updateCredentials(
        req.user.id,
        req.params.accountId,
        req.body,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  syncAccount = async (req, res, next) => {
    try {
      const result = await this.service.syncAccount(req.user.id, req.params.accountId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getCurrentPrice = async (req, res, next) => {
    try {
      const result = await this.service.getCurrentPrice(
        req.user.id,
        req.params.accountId,
        req.params.symbol,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSymbolSpecification = async (req, res, next) => {
    try {
      const result = await this.service.getSymbolSpecification(
        req.user.id,
        req.params.accountId,
        req.params.symbol,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listSnapshots = async (req, res, next) => {
    try {
      const filters = {
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listSnapshots(
        req.params.accountId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  checkHealth = async (req, res, next) => {
    try {
      const result = await this.service.checkHealth(req.params.accountId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default AccountController;