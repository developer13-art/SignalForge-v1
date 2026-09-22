/**
 * Health Check Routes
 *
 * Exposes liveness, readiness, and detailed health endpoints used by
 * load balancers, container orchestrators, and monitoring systems.
 *
 * @module signalforge/server/routes/health
 */

import { Router } from 'express';

import appConfig from '../config/app.config.js';
import databaseConfig from '../config/database.config.js';
import { getLogger } from '../bootstrap/initLogger.js';

const startedAt = Date.now();

function uptimeSeconds() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

export function buildHealthRouter() {
  const router = Router();
  const logger = getLogger('health');

  router.get('/', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: appConfig.name,
      version: appConfig.version,
      environment: appConfig.env,
      uptimeSeconds: uptimeSeconds(),
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/ready', async (req, res) => {
    const checks = {};

    try {
      const { getDatabase } = await import('../bootstrap/initDatabase.js');
      const db = getDatabase();
      const result = await db.healthCheck();
      checks.database = result;
    } catch (error) {
      checks.database = { healthy: false, error: error.message };
      logger.warn({ err: error }, 'Readiness check failed on database');
    }

    const allHealthy = Object.values(checks).every((check) => check.healthy !== false);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/detailed', async (req, res) => {
    const checks = {};

    try {
      const { getDatabase } = await import('../bootstrap/initDatabase.js');
      const db = getDatabase();
      checks.database = {
        ...(await db.healthCheck()),
        pool: db.stats,
        config: {
          host: databaseConfig.host,
          port: databaseConfig.port,
          database: databaseConfig.database,
        },
      };
    } catch (error) {
      checks.database = { healthy: false, error: error.message };
    }

    try {
      const { getEventBus } = await import('../bootstrap/initEventBus.js');
      const bus = getEventBus();
      checks.eventBus = {
        healthy: true,
        listenerCount: bus.listenerCount,
      };
    } catch (error) {
      checks.eventBus = { healthy: false, error: error.message };
    }

    try {
      const { getJobRunner } = await import('../bootstrap/initJobRunner.js');
      const runner = getJobRunner();
      checks.jobRunner = {
        healthy: true,
        ...runner.stats,
      };
    } catch (error) {
      checks.jobRunner = { healthy: false, error: error.message };
    }

    try {
      const { getWebSocket } = await import('../bootstrap/initWebSocket.js');
      const ws = getWebSocket();
      checks.webSocket = ws
        ? {
            healthy: true,
            connectedUsers: ws.connectedUsers,
            connectedSockets: ws.connectedSockets,
          }
        : { healthy: false, error: 'Not initialized' };
    } catch (error) {
      checks.webSocket = { healthy: false, error: error.message };
    }

    const memory = process.memoryUsage();
    checks.runtime = {
      healthy: true,
      pid: process.pid,
      nodeVersion: process.version,
      uptimeSeconds: uptimeSeconds(),
      memory: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
    };

    const allHealthy = Object.values(checks).every((check) => check.healthy !== false);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      service: appConfig.name,
      version: appConfig.version,
      environment: appConfig.env,
      uptimeSeconds: uptimeSeconds(),
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

const router = buildHealthRouter();

export default router;