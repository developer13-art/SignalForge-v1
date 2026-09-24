/**
 * Trader Routes
 *
 * @module signalforge/server/modules/traders/routes
 */

import { Router } from 'express';

import { TraderController } from './trader.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildTraderRouter(controller = null) {
  const router = Router();
  const traderController = controller || new TraderController();

  router.get('/traders', traderController.listPublicTraders);
  router.get('/traders/leaderboard', traderController.getLeaderboard);
  router.get('/traders/leaderboard/top', traderController.getTopTraders);
  router.get('/traders/leaderboard/consistency', traderController.getConsistencyLeaders);
  router.get('/traders/slug/:slug', traderController.getTraderBySlug);
  router.get('/traders/:traderId', traderController.getTrader);
  router.get('/traders/:traderId/followers', traderController.listFollowers);

  router.use(authenticationMiddleware());

  router.post('/traders', traderController.register);
  router.get('/traders/me/profile', traderController.getMyTrader);
  router.get('/traders/me/detail', traderController.getMyProfile);
  router.patch('/traders/:traderId', traderController.updateTrader);
  router.patch('/traders/:traderId/profile', traderController.updateMyProfile);
  router.post('/traders/:traderId/profile/avatar', traderController.updateAvatar);
  router.delete('/traders/:traderId/profile/avatar', traderController.removeAvatar);

  router.post('/traders/:traderId/follow', traderController.follow);
  router.delete('/traders/:traderId/follow', traderController.unfollow);
  router.post('/traders/:traderId/follow/pause', traderController.pauseFollowing);
  router.post('/traders/:traderId/follow/resume', traderController.resumeFollowing);
  router.get('/traders/following/me', traderController.listFollowing);

  router.get('/traders/:traderId/copy-settings', traderController.getCopySettings);
  router.patch('/traders/:traderId/copy-settings', traderController.updateCopySettings);

  router.post(
    '/admin/traders/:traderId/approve',
    requireAdminMiddleware(),
    traderController.approve,
  );
  router.post(
    '/admin/traders/:traderId/suspend',
    requireAdminMiddleware(),
    traderController.suspend,
  );
  router.post(
    '/admin/traders/:traderId/reinstate',
    requireAdminMiddleware(),
    traderController.reinstate,
  );
  router.get(
    '/admin/traders/stats',
    requireAdminMiddleware(),
    traderController.getStats,
  );

  return router;
}

export default buildTraderRouter;