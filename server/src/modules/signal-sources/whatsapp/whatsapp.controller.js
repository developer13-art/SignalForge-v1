/**
 * WhatsApp Controller
 *
 * @module signalforge/server/modules/signal-sources/whatsapp/controller
 */

import { WhatsAppService } from './whatsapp.service.js';

export class WhatsAppController {
  constructor(service = null) {
    this.service = service || new WhatsAppService();
  }

  connect = async (req, res, next) => {
    try {
      const result = await this.service.connect(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  disconnect = async (req, res, next) => {
    try {
      const result = await this.service.disconnect(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateGroups = async (req, res, next) => {
    try {
      const result = await this.service.updateGroups(req.user.id, req.body.groupIds || []);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  handleWebhook = async (req, res, next) => {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }

      const result = await this.service.handleWebhook(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default WhatsAppController;