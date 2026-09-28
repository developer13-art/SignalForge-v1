/**
 * Signal Collection Controller
 *
 * @module signalforge/server/modules/signal-collection/controller
 */

import { CollectionService } from './collection.service.js';

export class CollectionController {
  constructor(service = null) {
    this.service = service || new CollectionService();
  }

  getItem = async (req, res, next) => {
    try {
      const item = await this.service.getItem(req.params.itemId);
      res.status(200).json({ item });
    } catch (error) {
      next(error);
    }
  };

  getByMessageId = async (req, res, next) => {
    try {
      const item = await this.service.getByMessageId(req.params.messageId);
      res.status(200).json({ item });
    } catch (error) {
      next(error);
    }
  };

  cancelItem = async (req, res, next) => {
    try {
      const result = await this.service.cancel(req.params.itemId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req, res, next) => {
    try {
      const stats = await this.service.stats();
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };
}

export default CollectionController;