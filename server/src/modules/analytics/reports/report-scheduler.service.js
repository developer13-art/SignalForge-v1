/**
 * Report Scheduler Service
 *
 * @module signalforge/server/modules/analytics/reports/report-scheduler
 */

import { getLogger } from '../../../bootstrap/initLogger.js';

export class ReportSchedulerService {
  constructor() {
    this.schedules = new Map();
    this.intervalHandle = null;
    this.logger = getLogger('analytics-report-scheduler');
  }

  register(scheduleId, options) {
    if (!scheduleId || typeof options !== 'object') {
      throw new Error('Schedule id and options are required');
    }
    if (typeof options.handler !== 'function') {
      throw new Error('Schedule handler must be a function');
    }
    this.schedules.set(scheduleId, {
      scheduleId,
      intervalMs: options.intervalMs || 24 * 60 * 60 * 1000,
      handler: options.handler,
      lastRunAt: 0,
      enabled: options.enabled !== false,
    });
  }

  unregister(scheduleId) {
    this.schedules.delete(scheduleId);
  }

  async tick() {
    const now = Date.now();
    for (const schedule of this.schedules.values()) {
      if (!schedule.enabled) {
        continue;
      }
      if (now - schedule.lastRunAt < schedule.intervalMs) {
        continue;
      }
      schedule.lastRunAt = now;
      try {
        await schedule.handler();
      } catch (error) {
        this.logger.error(
          { err: error, scheduleId: schedule.scheduleId },
          'Scheduled report failed',
        );
      }
    }
  }

  start(intervalMs = 60000) {
    if (this.intervalHandle) {
      return;
    }
    this.intervalHandle = setInterval(() => this.tick(), intervalMs);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

export default ReportSchedulerService;