/**
 * DNA Rule Routes
 *
 * @module signalforge/server/modules/provider-dna/rules/routes
 */
const { Router } = require('express');
const { RuleController } = require('./rule.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildRuleRouter(controller = null) {
  const router = Router({ mergeParams: true });
  const ruleController = controller || new RuleController();

  router.use(authenticationMiddleware());

  router.post('/', ruleController.create);
  router.get('/', ruleController.list);
  router.get('/abbreviations', ruleController.listAbbreviations);
  router.post('/abbreviations', ruleController.addAbbreviation);
  router.post('/match', ruleController.match);
  router.get('/:ruleId', ruleController.get);
  router.patch('/:ruleId', ruleController.update);
  router.delete('/:ruleId', ruleController.delete);

  return router;
}
module.exports = buildRuleRouter;
module.exports.buildRuleRouter = buildRuleRouter;
