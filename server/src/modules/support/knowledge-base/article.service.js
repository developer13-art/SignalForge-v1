/**
 * Article Service
 *
 * Business logic for knowledge base articles: publishing, searching,
 * and category listing.
 *
 * @module server/modules/support/knowledge-base/article.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './article.repository';

function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

export async function createArticle({ title, body, category, published, authorId, locale, tags }) {
  if (!title || !body) {
    throw new AppError('title and body are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const slug = slugify(title);

  if (!slug) {
    throw new AppError('Could not generate a valid slug from the title', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = await repository.findBySlug({ slug, locale: locale || 'en' });

  if (existing) {
    throw new AppError('An article with this slug already exists', ERROR_CODES.CONFLICT, 409);
  }

  const article = await repository.insertArticle({
    slug,
    title,
    body,
    category,
    published,
    authorId,
    locale,
    tags,
  });

  logger.info({ articleId: article.id, slug }, 'Knowledge base article created');

  return {
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    published: article.published,
    locale: article.locale,
  };
}

export async function getArticleById({ articleId }) {
  if (!articleId) {
    throw new AppError('articleId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const article = await repository.findById({ articleId });

  if (!article) {
    throw new AppError('Article not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    body: article.body,
    published: article.published,
    locale: article.locale,
    tags: article.tags ? JSON.parse(article.tags) : [],
    createdAt: article.created_at,
    updatedAt: article.updated_at,
  };
}

export async function getArticleBySlug({ slug, locale = 'en' }) {
  if (!slug) {
    throw new AppError('slug is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const article = await repository.findBySlug({ slug, locale });

  if (!article) {
    throw new AppError('Article not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    body: article.body,
    published: article.published,
    locale: article.locale,
    tags: article.tags ? JSON.parse(article.tags) : [],
    createdAt: article.created_at,
    updatedAt: article.updated_at,
  };
}

export async function listArticles({ category, locale, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listPublished({
    category,
    locale: locale || 'en',
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      articleId: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      updatedAt: row.updated_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function searchArticles({ query, locale = 'en' }) {
  if (!query) {
    throw new AppError('query is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.searchArticles({ query, locale });

  return rows.map((row) => ({
    articleId: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
  }));
}

export async function updateArticle({ articleId, title, body, category, published, tags }) {
  if (!articleId) {
    throw new AppError('articleId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateArticle({
    articleId,
    title,
    body,
    category,
    published,
    tags,
  });

  if (!updated) {
    throw new AppError('Article not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    articleId: updated.id,
    slug: updated.slug,
    title: updated.title,
    category: updated.category,
    published: updated.published,
    updatedAt: updated.updated_at,
  };
}

export async function deleteArticle({ articleId }) {
  if (!articleId) {
    throw new AppError('articleId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteArticle({ articleId });

  if (!deleted) {
    throw new AppError('Article not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deleted: true };
}

export async function listCategories({ locale = 'en' }) {
  const rows = await repository.listCategories({ locale });

  return rows.map((row) => ({
    category: row.category,
    count: row.count,
  }));
}

export const articleService = {
  createArticle,
  getArticleById,
  getArticleBySlug,
  listArticles,
  searchArticles,
  updateArticle,
  deleteArticle,
  listCategories,
};