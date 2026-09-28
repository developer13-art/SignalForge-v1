/**
 * Email Controller
 *
 * @module signalforge/server/modules/signal-sources/email/controller
 */

import { EmailService } from './email.service.js';

export class EmailController {
  constructor(service = null) {
    this.service = service || new EmailService();
  }

  createConnection = async (req, res, next) => {
    try {
      const connection = await this.service.createConnection(req.user.id, req.body);
      res.status(201).json({ connection });
    } catch (error) {
      next(error);
    }
  };

  getConnection = async (req, res, next) => {
    try {
      const connection = await this.service.getConnection(req.user.id);
      res.status(200).json({ connection });
    } catch (error) {
      next(error);
    }
  };

  updateConnection = async (req, res, next) => {
    try {
      const result = await this.service.updateConnection(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteConnection = async (req, res, next) => {
    try {
      const result = await this.service.deleteConnection(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default EmailController;