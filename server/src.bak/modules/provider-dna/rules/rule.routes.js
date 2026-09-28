/**
 * DNA Rule Routes
 *
 * @module signalforge/server/modules/provider-dna/rules/routes
 */

import { Router } from 'express';

import { RuleController } from './rule.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildRuleRouter(controller = null) {
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

export default buildRuleRouter;