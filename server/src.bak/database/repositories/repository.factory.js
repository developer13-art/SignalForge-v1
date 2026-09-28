/**
 * Repository Factory
 *
 * Builds a domain repository instance for a table with the shared
 * base operations. Can be used to quickly create repositories for
 * simple tables without writing a dedicated class.
 *
 * @module server/database/repositories/repository.factory
 */

import BaseRepository from './base.repository';

const CACHE = new Map();

export function createRepository(table) {
  if (!table) {
    throw new Error('table is required');
  }

  if (CACHE.has(table)) {
    return CACHE.get(table);
  }

  const instance = new BaseRepository(table);
  CACHE.set(table, instance);
  return instance;
}

export function clearRepositoryCache() {
  CACHE.clear();
}

export const repositoryFactory = {
  createRepository,
  clearRepositoryCache,
};