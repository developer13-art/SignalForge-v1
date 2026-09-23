/**
 * Source Controller
 *
 * @module signalforge/server/modules/signal-sources/controller
 */

import { SourceService } from './source.service.js';
import { validateCreateSourcePayload, validateUpdateSourcePayload } from './source.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class SourceController {
  constructor(service = null) {
    this.service = service || new SourceService();
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

  createSource = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreateSourcePayload, req.body);
      const source = await this.service.create(req.user.id, req.body);
      res.status(201).json({ source });
    } catch (error) {
      next(error);
    }
  };

  listSources = async (req, res, next) => {
    try {
      const filters = {
        sourceType: req.query.sourceType,
        status: req.query.status,
      };
      const sources = await this.service.listForUser(req.user.id, filters);
      res.status(200).json({ sources });
    } catch (error) {
      next(error);
    }
  };

  getSource = async (req, res, next) => {
    try {
      const source = await this.service.getByIdForUser(req.params.sourceId, req.user.id);
      res.status(200).json({ source });
    } catch (error) {
      next(error);
    }
  };

  updateSource = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpdateSourcePayload, req.body);
      const source = await this.service.update(req.params.sourceId, req.user.id, req.body);
      res.status(200).json({ source });
    } catch (error) {
      next(error);
    }
  };

  deleteSource = async (req, res, next) => {
    try {
      const result = await this.service.delete(req.params.sourceId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  connectSource = async (req, res, next) => {
    try {
      const result = await this.service.connect(req.params.sourceId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  disconnectSource = async (req, res, next) => {
    try {
      const result = await this.service.disconnect(req.params.sourceId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  enableSource = async (req, res, next) => {
    try {
      const result = await this.service.enable(req.params.sourceId, req.user.id);
      res.status(200).json({ source: result });
    } catch (error) {
      next(error);
    }
  };

  disableSource = async (req, res, next) => {
    try {
      const result = await this.service.disable(req.params.sourceId, req.user.id);
      res.status(200).json({ source: result });
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req, res, next) => {
    try {
      const filters = {
        channelId: req.query.channelId,
        processingStatus: req.query.processingStatus,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listMessages(
        req.params.sourceId,
        req.user.id,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMessage = async (req, res, next) => {
    try {
      const message = await this.service.getMessage(
        req.params.sourceId,
        req.user.id,
        req.params.messageId,
      );
      res.status(200).json({ message });
    } catch (error) {
      next(error);
    }
  };
}

export default SourceController;