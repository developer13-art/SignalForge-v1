/**
 * Article Controller
 *
 * HTTP handlers for knowledge base article operations.
 *
 * @module server/modules/support/knowledge-base/article.controller
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { successResponse } = require('../../../lib/response/success.response');
const { paginatedResponse } = require('../../../lib/response/paginated.response');
const { articleService } = require('./article.service');
async function listArticles(req, res) {
  const { page, limit, category, locale } = req.query;

  const result = await articleService.listArticles({
    category,
    locale,
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}
async function getArticle(req, res) {
  const { slug } = req.params;
  const { locale } = req.query;

  const article = await articleService.getArticleBySlug({ slug, locale: locale || 'en' });

  return successResponse(res, { article });
}
async function searchArticles(req, res) {
  const { q, locale } = req.query;

  if (!q) {
    throw new AppError('Search query is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const articles = await articleService.searchArticles({ query: q, locale: locale || 'en' });

  return successResponse(res, { articles });
}
async function listCategories(req, res) {
  const { locale } = req.query;

  const categories = await articleService.listCategories({ locale: locale || 'en' });

  return successResponse(res, { categories });
}
async function createArticle(req, res) {
  const userId = req.user && req.user.id;
  const { title, body, category, published, locale, tags } = req.body || {};

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const article = await articleService.createArticle({
    title,
    body,
    category,
    published,
    authorId: userId,
    locale,
    tags,
  });

  return successResponse(res, { article }, 201);
}
async function updateArticle(req, res) {
  const { articleId } = req.params;
  const { title, body, category, published, tags } = req.body || {};

  const article = await articleService.updateArticle({
    articleId,
    title,
    body,
    category,
    published,
    tags,
  });

  return successResponse(res, { article });
}
async function deleteArticle(req, res) {
  const { articleId } = req.params;

  const result = await articleService.deleteArticle({ articleId });

  return successResponse(res, result);
}
const articleController = {
  listArticles,
  getArticle,
  searchArticles,
  listCategories,
  createArticle,
  updateArticle,
  deleteArticle,
};
module.exports.articleController = articleController;

module.exports.listArticles = listArticles;

module.exports.getArticle = getArticle;

module.exports.searchArticles = searchArticles;

module.exports.listCategories = listCategories;

module.exports.createArticle = createArticle;

module.exports.updateArticle = updateArticle;

module.exports.deleteArticle = deleteArticle;
