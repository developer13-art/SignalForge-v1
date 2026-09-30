'use strict';

/**
 * Database Module Index
 *
 * Central CommonJS export for all database utilities. Provides a
 * single import point for the connection pool, transaction helpers,
 * query builder, health checks, repositories, and helpers.
 *
 * @module server/database
 */

const connection = require('./connection');
const transactionModule = require('./transaction');
const queryBuilderModule = require('./query-builder');
const queryLoggerModule = require('./query-logger');
const healthCheckModule = require('./health-check');
const migrationsRunnerModule = require('./migrations/runner');
const baseRepositoryModule = require('./repositories/base.repository');
const repositoryFactoryModule = require('./repositories/repository.factory');
const repositoryHelpers = require('./repositories/repository.helpers');
const paginationHelper = require('./helpers/pagination.helper');
const filterHelper = require('./helpers/filter.helper');
const sortHelper = require('./helpers/sort.helper');
const includeHelper = require('./helpers/include.helper');

module.exports = {
  // Connection
  db: connection.db,
  getPool: connection.getPool,
  getClient: connection.getClient,
  closePool: connection.closePool,

  // Transactions
  withTransaction: transactionModule.withTransaction,
  withClient: transactionModule.withClient,
  withSavepoint: transactionModule.withSavepoint,

  // Query
  query: queryBuilderModule.query,

  // Query Logger
  attachQueryLogger: queryLoggerModule.attachQueryLogger,
  enableQueryLogging: queryLoggerModule.enableQueryLogging,
  disableQueryLogging: queryLoggerModule.disableQueryLogging,

  // Health
  checkDatabaseHealth: healthCheckModule.checkDatabaseHealth,
  getConnectionStats: healthCheckModule.getConnectionStats,

  // Migrations
  runMigrations: migrationsRunnerModule.runMigrations,
  rollbackMigration: migrationsRunnerModule.rollbackMigration,
  listAppliedMigrations: migrationsRunnerModule.listAppliedMigrations,

  // Repositories
  baseRepository: baseRepositoryModule.baseRepository,
  repositoryFactory: repositoryFactoryModule.repositoryFactory,
  repositoryHelpers,

  // Helpers
  paginationHelper,
  filterHelper,
  sortHelper,
  includeHelper,
};