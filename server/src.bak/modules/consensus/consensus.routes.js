/**
 * Consensus Routes
 *
 * @module signalforge/server/modules/consensus/routes
 */

import { Router } from 'express';

import { ConsensusController } from './consensus.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildConsensusRouter(controller = null) {
  const router = Router();
  const consensusController = controller || new ConsensusController();

  router.use(authenticationMiddleware());

  router.post('/compute', consensusController.compute);
  router.get('/', consensusController.list);
  router.get('/stats', requireAdminMiddleware(), consensusController.stats);
  router.get('/:consensusId', consensusController.getById);
  router.get('/:consensusId/members', consensusController.listMembers);

  return router;
}

export default buildConsensusRouter;