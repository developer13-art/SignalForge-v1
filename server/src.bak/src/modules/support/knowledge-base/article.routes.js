/**
 * Article Routes
 *
 * Express routes for knowledge base articles. Public read endpoints
 * and authenticated admin endpoints.
 *
 * @module server/modules/support/knowledge-base/article.routes
 */
const { Router } = require('express');
const { articleController } = require('./article.controller');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware');
const { authorizationMiddleware } = require('../../../middleware/authorization.middleware');
const { asyncHandler } = require('../../../lib/async-handler');

const router = Router();

router.get(
  '/',
  asyncHandler(articleController.listArticles),
);

router.get(
  '/categories',
  asyncHandler(articleController.listCategories),
);

router.get(
  '/search',
  asyncHandler(articleController.searchArticles),
);

router.get(
  '/:slug',
  asyncHandler(articleController.getArticle),
);

router.post(
  '/',
  authenticationMiddleware,
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN', 'SUPPORT']),
  asyncHandler(articleController.createArticle),
);

router.patch(
  '/:articleId',
  authenticationMiddleware,
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN', 'SUPPORT']),
  asyncHandler(articleController.updateArticle),
);

router.delete(
  '/:articleId',
  authenticationMiddleware,
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(articleController.deleteArticle),
);
module.exports = router;