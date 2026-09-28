/**
 * Session Controller (User Module)
 *
 * @module signalforge/server/modules/users/sessions/controller
 */

import { SessionService } from './session.service.js';

export class SessionController {
  constructor(service = null) {
    this.service = service || new SessionService();
  }

  listSessions = async (req, res, next) => {
    try {
      const sessions = await this.service.list(req.user.id);
      res.status(200).json({ sessions });
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req, res, next) => {
    try {
      const result = await this.service.revoke(
        req.params.sessionId,
        req.user.id,
        'user_action',
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  revokeAllSessions = async (req, res, next) => {
    try {
      const exceptSessionId = req.user.sessionId || null;
      const result = await this.service.revokeAll(
        req.user.id,
        exceptSessionId,
        'user_action',
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default SessionController;