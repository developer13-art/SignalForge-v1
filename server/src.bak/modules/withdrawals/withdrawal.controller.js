/**
 * Withdrawal Controller
 *
 * @module signalforge/server/modules/withdrawals/controller
 */

import { WithdrawalService } from './withdrawal.service.js';
import {
  validateCreateAccountPayload,
  validateWithdrawalRequestPayload,
  validateDecisionPayload,
} from './withdrawal.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class WithdrawalController {
  constructor(service = null) {
    this.service = service || new WithdrawalService();
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

  listSupportedMethods = async (req, res, next) => {
    try {
      const methods = this.service.listSupportedMethods();
      res.status(200).json({ methods });
    } catch (error) {
      next(error);
    }
  };

  addAccount = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateAccountPayload, req.body);
      const account = await this.service.addAccount(req.user.id, req.body);
      res.status(201).json({ account });
    } catch (error) {
      next(error);
    }
  };

  listAccounts = async (req, res, next) => {
    try {
      const filters = {
        methodType: req.query.methodType,
        status: req.query.status,
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

  updateAccount = async (req, res, next) => {
    try {
      const account = await this.service.updateAccount(
        req.user.id,
        req.params.accountId,
        req.body,
      );
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  };

  verifyAccount = async (req, res, next) => {
    try {
      const account = await this.service.verifyAccount(req.user.id, req.params.accountId);
      res.status(200).json({ account });
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

  requestWithdrawal = async (req, res, next) => {
    try {
      this.validateOrThrow(validateWithdrawalRequestPayload, req.body);
      const request = await this.service.requestWithdrawal(req.user.id, req.body);
      res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  };

  listRequests = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        purpose: req.query.purpose,
        methodType: req.query.methodType,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listRequests(
        req.user.id,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getRequest = async (req, res, next) => {
    try {
      const request = await this.service.getRequest(req.user.id, req.params.requestId);
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  };

  cancelRequest = async (req, res, next) => {
    try {
      const request = await this.service.cancelRequest(req.user.id, req.params.requestId);
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  };

  getStatusCounts = async (req, res, next) => {
    try {
      const counts = await this.service.getStatusCounts({
        userId: req.user.id,
        since: req.query.since,
      });
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  getMethodBreakdown = async (req, res, next) => {
    try {
      const breakdown = await this.service.getMethodBreakdown({
        userId: req.user.id,
        since: req.query.since,
      });
      res.status(200).json({ breakdown });
    } catch (error) {
      next(error);
    }
  };

  adminListRequests = async (req, res, next) => {
    try {
      const filters = {
        userId: req.query.userId,
        status: req.query.status,
        purpose: req.query.purpose,
        methodType: req.query.methodType,
        requiresReview:
          req.query.requiresReview !== undefined
            ? req.query.requiresReview === 'true'
            : undefined,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listAllRequests(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  adminApprove = async (req, res, next) => {
    try {
      const request = await this.service.approveRequest(req.params.requestId, req.user.id);
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  };

  adminReject = async (req, res, next) => {
    try {
      this.validateOrThrow(validateDecisionPayload, { ...req.body, decision: 'REJECT' });
      const request = await this.service.rejectRequest(
        req.params.requestId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  };

  adminProcess = async (req, res, next) => {
    try {
      const request = await this.service.processRequest(req.params.requestId, req.user.id);
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  };

  adminStatusCounts = async (req, res, next) => {
    try {
      const counts = await this.service.getStatusCounts({
        userId: req.query.userId,
        since: req.query.since,
      });
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  adminMethodBreakdown = async (req, res, next) => {
    try {
      const breakdown = await this.service.getMethodBreakdown({
        userId: req.query.userId,
        since: req.query.since,
      });
      res.status(200).json({ breakdown });
    } catch (error) {
      next(error);
    }
  };
}

export default WithdrawalController;