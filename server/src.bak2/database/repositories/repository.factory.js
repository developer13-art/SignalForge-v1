/**
 * Repository Factory
 *
 * Builds a domain repository instance for a table with the shared
 * base operations. Can be used to quickly create repositories for
 * simple tables without writing a dedicated class.
 *
 * @module server/database/repositories/repository.factory
 */
const BaseRepository = require('./base.repository');

const CACHE = new Map();
function createRepository(table) {
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
function clearRepositoryCache() {
  CACHE.clear();
}
const repositoryFactory = {
  createRepository,
  clearRepositoryCache,
};
module.exports.repositoryFactory = repositoryFactory;
module.exports.createRepository = createRepository;
module.exports.clearRepositoryCache = clearRepositoryCache;
