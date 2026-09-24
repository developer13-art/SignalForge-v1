/**
 * Category Service
 *
 * Business logic for support ticket categories.
 *
 * @module server/modules/support/categories/category.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import * as repository from './category.repository';

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 64);
}

export async function createCategory({ name, description, active }) {
  if (!name) {
    throw new AppError('name is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const slug = slugify(name);

  const existing = await repository.findBySlug({ slug });

  if (existing) {
    throw new AppError('A category with this name already exists', ERROR_CODES.CONFLICT, 409);
  }

  const record = await repository.insertCategory({
    name,
    slug,
    description,
    active,
  });

  logger.info({ categoryId: record.id, slug }, 'Support category created');

  return {
    categoryId: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    active: record.active,
  };
}

export async function listCategories({ activeOnly = true } = {}) {
  const rows = await repository.listAll({ activeOnly });

  return rows.map((row) => ({
    categoryId: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    active: row.active,
  }));
}

export async function getCategoryById({ categoryId }) {
  if (!categoryId) {
    throw new AppError('categoryId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findById({ categoryId });

  if (!record) {
    throw new AppError('Category not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    categoryId: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    active: record.active,
  };
}

export async function updateCategory({ categoryId, name, description, active }) {
  if (!categoryId) {
    throw new AppError('categoryId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateCategory({
    categoryId,
    name,
    description,
    active,
  });

  if (!updated) {
    throw new AppError('Category not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    categoryId: updated.id,
    name: updated.name,
    slug: updated.slug,
    description: updated.description,
    active: updated.active,
  };
}

export async function deleteCategory({ categoryId }) {
  if (!categoryId) {
    throw new AppError('categoryId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteCategory({ categoryId });

  if (!deleted) {
    throw new AppError('Category not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deleted: true };
}

export const categoryService = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};