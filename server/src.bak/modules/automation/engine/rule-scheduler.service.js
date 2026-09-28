/**
 * Rule Scheduler Service
 *
 * @module signalforge/server/modules/automation/engine/rule-scheduler
 */

import { getLogger } from '../../../bootstrap/initLogger.js';

export class RuleSchedulerService {
  constructor() {
    this.logger = getLogger('automation-scheduler');
    this.schedules = new Map();
    this.intervalHandle = null;
  }

  register(scheduleId, options) {
    if (!scheduleId || typeof options !== 'object') {
      throw new Error('Schedule id and options are required');
    }
    this.schedules.set(scheduleId, {
      scheduleId,
      intervalMs: options.intervalMs || 60000,
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
        this.logger.error({ err: error, scheduleId: schedule.scheduleId }, 'Scheduled rule failed');
      }
    }
  }

  start() {
    if (this.intervalHandle) {
      return;
    }
    this.intervalHandle = setInterval(() => this.tick(), 30000);
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

export default RuleSchedulerService;