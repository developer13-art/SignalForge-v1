/**
 * TradingView Controller
 *
 * @module signalforge/server/modules/signal-sources/tradingview/controller
 */

import { TradingViewService } from './tradingview.service.js';

export class TradingViewController {
  constructor(service = null) {
    this.service = service || new TradingViewService();
  }

  createWebhook = async (req, res, next) => {
    try {
      const result = await this.service.createWebhook(req.user.id, req.body);
      res.status(201).json({ webhook: result });
    } catch (error) {
      next(error);
    }
  };

  listWebhooks = async (req, res, next) => {
    try {
      const webhooks = await this.service.listWebhooks(req.user.id);
      res.status(200).json({ webhooks });
    } catch (error) {
      next(error);
    }
  };

  updateWebhook = async (req, res, next) => {
    try {
      const webhook = await this.service.updateWebhook(req.user.id, req.params.webhookId, req.body);
      res.status(200).json({ webhook });
    } catch (error) {
      next(error);
    }
  };

  rotateSecret = async (req, res, next) => {
    try {
      const result = await this.service.rotateSecret(req.user.id, req.params.webhookId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteWebhook = async (req, res, next) => {
    try {
      const result = await this.service.deleteWebhook(req.user.id, req.params.webhookId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default TradingViewController;