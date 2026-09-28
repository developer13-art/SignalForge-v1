/**
 * Consensus Routes
 *
 * @module signalforge/server/modules/consensus/routes
 */
const { Router } = require('express');
const { ConsensusController } = require('./consensus.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildConsensusRouter(controller = null) {
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
module.exports = buildConsensusRouter;
module.exports.buildConsensusRouter = buildConsensusRouter;
