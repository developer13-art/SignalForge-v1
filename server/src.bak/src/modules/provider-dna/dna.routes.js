/**
 * Provider DNA Routes
 *
 * @module signalforge/server/modules/provider-dna/routes
 */
const { Router } = require('express');
const { DnaController } = require('./dna.controller.js');
const { buildRuleRouter } = require('./rules/rule.routes.js');
const { buildProfileRouter } = require('./profile/profile.routes.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
function buildDnaRouter(controller = null) {
  const router = Router();
  const dnaController = controller || new DnaController();

  router.use(authenticationMiddleware());

  router.post('/providers/:providerId/dna', dnaController.ensureDna);
  router.get('/providers/:providerId/dna', dnaController.getDna);
  router.patch('/providers/:providerId/dna', dnaController.updateDna);

  router.post('/providers/:providerId/dna/fast-path', dnaController.tryFastPath);
  router.post('/providers/:providerId/dna/learn', dnaController.learnFromHistory);
  router.post('/providers/:providerId/dna/reinforce', dnaController.applyReinforcement);
  router.post('/providers/:providerId/dna/outcome', dnaController.recordOutcome);

  router.post('/providers/:providerId/dna/test', dnaController.runTest);
  router.get('/providers/:providerId/dna/tests', dnaController.listTests);

  router.post('/providers/:providerId/dna/versions', dnaController.createVersion);
  router.get('/providers/:providerId/dna/versions', dnaController.listVersions);
  router.get('/providers/:providerId/dna/versions/:versionId', dnaController.getVersion);
  router.get(
    '/providers/:providerId/dna/versions/:versionIdA/compare/:versionIdB',
    dnaController.compareVersions,
  );

  router.use('/providers/:providerId/dna/rules', buildRuleRouter());
  router.use('/providers/:providerId/dna/profile', buildProfileRouter());

  return router;
}
module.exports = buildDnaRouter;
module.exports.buildDnaRouter = buildDnaRouter;
