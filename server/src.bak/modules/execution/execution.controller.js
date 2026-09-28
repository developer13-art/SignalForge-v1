/**
 * Execution Controller
 *
 * @module signalforge/server/modules/execution/controller
 */

import { ExecutionService } from './execution.service.js';
import {
  validateOpenPositionPayload,
  validateModifyPositionPayload,
  validatePartialClosePayload,
} from './execution.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class ExecutionController {
  constructor(service = null) {
    this.service = service || new ExecutionService();
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

  openPosition = async (req, res, next) => {
    try {
      this.validateOrThrow(validateOpenPositionPayload, req.body);
      const result = await this.service.openPosition(
        {
          ...req.body,
          userId: req.user.id,
        },
        { gatewayType: req.body.gatewayType },
      );
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  closePosition = async (req, res, next) => {
    try {
      const result = await this.service.closePosition(req.body.trade, {
        gatewayType: req.body.gatewayType,
      });
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  modifyPosition = async (req, res, next) => {
    try {
      this.validateOrThrow(validateModifyPositionPayload, req.body.modifications);
      const result = await this.service.modifyPosition(
        req.body.trade,
        req.body.modifications,
        { gatewayType: req.body.gatewayType },
      );
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  partialClose = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePartialClosePayload, req.body);
      const result = await this.service.partialClose(
        req.body.trade,
        req.body.percentage,
        { gatewayType: req.body.gatewayType },
      );
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  placePendingOrder = async (req, res, next) => {
    try {
      this.validateOrThrow(validateOpenPositionPayload, req.body);
      const result = await this.service.placePendingOrder(
        { ...req.body, userId: req.user.id },
        { gatewayType: req.body.gatewayType },
      );
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  cancelPendingOrder = async (req, res, next) => {
    try {
      const result = await this.service.cancelPendingOrder(req.body, {
        gatewayType: req.body.gatewayType,
      });
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  syncPositions = async (req, res, next) => {
    try {
      const result = await this.service.syncPositions(req.body.brokerAccount, {
        gatewayType: req.body.gatewayType,
      });
      res.status(200).json({ execution: result });
    } catch (error) {
      next(error);
    }
  };

  getRequest = async (req, res, next) => {
    try {
      const request = await this.service.getRequestById(req.params.requestId);
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  };

  listRequestsByTrade = async (req, res, next) => {
    try {
      const requests = await this.service.listRequestsByTrade(req.params.tradeId);
      res.status(200).json({ requests });
    } catch (error) {
      next(error);
    }
  };

  listRequests = async (req, res, next) => {
    try {
      const filters = {
        userId: req.query.userId,
        status: req.query.status,
        brokerAccountId: req.query.brokerAccountId,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listRequests(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listLogs = async (req, res, next) => {
    try {
      const filters = {
        tradeId: req.query.tradeId,
        executionRequestId: req.query.executionRequestId,
        operation: req.query.operation,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listLogs(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  latencyStats = async (req, res, next) => {
    try {
      const stats = await this.service.latencyStats({ since: req.query.since });
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };

  symbolBreakdown = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const breakdown = await this.service.symbolBreakdown({ since: req.query.since }, limit);
      res.status(200).json({ breakdown });
    } catch (error) {
      next(error);
    }
  };

  retryDeadLetter = async (req, res, next) => {
    try {
      const result = await this.service.retryDeadLetterRequest(req.params.requestId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listGateways = async (req, res, next) => {
    try {
      const gateways = this.service.listGateways();
      res.status(200).json({ gateways });
    } catch (error) {
      next(error);
    }
  };

  checkGateway = async (req, res, next) => {
    try {
      const result = await this.service.checkGatewayAvailability(req.params.gateway);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default ExecutionController;