/**
 * REST API Source Controller
 *
 * @module signalforge/server/modules/signal-sources/rest-api/controller
 */

import { RestApiService } from './rest-api.service.js';

export class RestApiController {
  constructor(service = null) {
    this.service = service || new RestApiService();
  }

  createKey = async (req, res, next) => {
    try {
      const key = await this.service.createKey(req.user.id, req.body);
      res.status(201).json({ key });
    } catch (error) {
      next(error);
    }
  };

  listKeys = async (req, res, next) => {
    try {
      const keys = await this.service.listKeys(req.user.id);
      res.status(200).json({ keys });
    } catch (error) {
      next(error);
    }
  };

  updateKey = async (req, res, next) => {
    try {
      const result = await this.service.updateKey(req.user.id, req.params.keyId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteKey = async (req, res, next) => {
    try {
      const result = await this.service.deleteKey(req.user.id, req.params.keyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  submitSignal = async (req, res, next) => {
    try {
      const result = await this.service.submitSignal(req, req.body);
      res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default RestApiController;