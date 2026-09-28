/**
 * Signal Classification Controller
 *
 * @module signalforge/server/modules/signal-classification/controller
 */

import { ClassificationService } from './classification.service.js';

export class ClassificationController {
  constructor(service = null) {
    this.service = service || new ClassificationService();
  }

  classifyMessage = async (req, res, next) => {
    try {
      const result = await this.service.classifyMessage({
        id: req.body.messageId || null,
        sourceId: req.body.sourceId || null,
        userId: req.body.userId || req.user?.id || null,
        text: req.body.text,
      }, {
        classifierKind: req.body.classifierKind,
      });
      res.status(200).json({ classification: result });
    } catch (error) {
      next(error);
    }
  };

  getByMessageId = async (req, res, next) => {
    try {
      const classification = await this.service.getByMessageId(req.params.messageId);
      res.status(200).json({ classification });
    } catch (error) {
      next(error);
    }
  };

  listByMessageId = async (req, res, next) => {
    try {
      const classifications = await this.service.listByMessageId(req.params.messageId);
      res.status(200).json({ classifications });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const filters = {
        classification: req.query.classification,
        classifierKind: req.query.classifierKind,
        sourceId: req.query.sourceId,
        minConfidence: req.query.minConfidence !== undefined ? Number(req.query.minConfidence) : undefined,
        maxConfidence: req.query.maxConfidence !== undefined ? Number(req.query.maxConfidence) : undefined,
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
      const filters = {
        sourceId: req.query.sourceId,
        since: req.query.since,
      };
      const stats = await this.service.stats(filters);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };
}

export default ClassificationController;