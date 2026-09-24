/**
 * Database Module Index
 *
 * Central export for all database utilities. Provides a single
 * import point for the connection pool, transaction helpers, query
 * builder, health checks, repositories, and helpers.
 *
 * @module server/database
 */

export { db, getPool, getClient, closePool } from './connection';
export { withTransaction, withClient, withSavepoint } from './transaction';
export { query } from './query-builder';
export { attachQueryLogger, enableQueryLogging, disableQueryLogging } from './query-logger';
export { checkDatabaseHealth, getConnectionStats } from './health-check';
export { runMigrations, rollbackMigration, listAppliedMigrations } from './migrations/runner';
export { baseRepository } from './repositories/base.repository';
export { repositoryFactory } from './repositories/repository.factory';
export * as repositoryHelpers from './repositories/repository.helpers';
export * as paginationHelper from './helpers/pagination.helper';
export * as filterHelper from './helpers/filter.helper';
export * as sortHelper from './helpers/sort.helper';
export * as includeHelper from './helpers/include.helper';