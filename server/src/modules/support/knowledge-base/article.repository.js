/**
 * Article Repository
 *
 * Persistence layer for knowledge base articles.
 *
 * @module server/modules/support/knowledge-base/article.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertArticle({
  slug,
  title,
  category,
  body,
  published,
  authorId,
  locale = 'en',
  tags,
}) {
  const { rows } = await db.query(
    `INSERT INTO knowledge_base_articles
       (slug, title, category, body, published, author_id, locale, tags, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
     RETURNING *`,
    [
      slug,
      title,
      category || null,
      body,
      published !== false,
      authorId || null,
      locale,
      tags ? JSON.stringify(tags) : null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findById({ articleId }) {
  const { rows } = await db.query(
    `SELECT * FROM knowledge_base_articles WHERE id = $1 LIMIT 1`,
    [articleId],
  );
  return rows[0] || null;
}

export async function findBySlug({ slug, locale = 'en' }) {
  const { rows } = await db.query(
    `SELECT * FROM knowledge_base_articles WHERE slug = $1 AND locale = $2 LIMIT 1`,
    [slug, locale],
  );
  return rows[0] || null;
}

export async function listPublished({ category, locale = 'en', pagination = {} }) {
  const conditions = ['published = TRUE', 'locale = $1'];
  const params = [locale];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT id, slug, title, category, published, locale, tags, created_at, updated_at
       FROM knowledge_base_articles
       ${where}
       ORDER BY title ASC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM knowledge_base_articles ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function searchArticles({ query, locale = 'en', limit = 20 }) {
  const searchTerm = `%${String(query || '').toLowerCase()}%`;
  const { rows } = await db.query(
    `SELECT id, slug, title, category, published, locale
       FROM knowledge_base_articles
      WHERE published = TRUE
        AND locale = $1
        AND (LOWER(title) LIKE $2 OR LOWER(body) LIKE $2)
      ORDER BY
        CASE WHEN LOWER(title) LIKE $2 THEN 0 ELSE 1 END,
        title ASC
      LIMIT $3`,
    [locale, searchTerm, limit],
  );
  return rows;
}

export async function updateArticle({
  articleId,
  title,
  body,
  category,
  published,
  tags,
}) {
  const { rows } = await db.query(
    `UPDATE knowledge_base_articles
        SET title = COALESCE($1, title),
            body = COALESCE($2, body),
            category = COALESCE($3, category),
            published = COALESCE($4, published),
            tags = COALESCE($5, tags),
            updated_at = $6
      WHERE id = $7
      RETURNING *`,
    [
      title || null,
      body || null,
      category || null,
      published === undefined ? null : published,
      tags ? JSON.stringify(tags) : null,
      nowIso(),
      articleId,
    ],
  );
  return rows[0] || null;
}

export async function deleteArticle({ articleId }) {
  const { rowCount } = await db.query(
    `DELETE FROM knowledge_base_articles WHERE id = $1`,
    [articleId],
  );
  return rowCount > 0;
}

export async function listCategories({ locale = 'en' }) {
  const { rows } = await db.query(
    `SELECT category, COUNT(*)::int AS count
       FROM knowledge_base_articles
      WHERE published = TRUE AND locale = $1 AND category IS NOT NULL
      GROUP BY category
      ORDER BY category ASC`,
    [locale],
  );
  return rows;
}

export const articleRepository = {
  insertArticle,
  findById,
  findBySlug,
  listPublished,
  searchArticles,
  updateArticle,
  deleteArticle,
  listCategories,
};