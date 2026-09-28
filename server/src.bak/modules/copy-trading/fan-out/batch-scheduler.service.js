/**
 * Batch Scheduler Service
 *
 * @module signalforge/server/modules/copy-trading/fan-out/batch-scheduler
 */

import { getLogger } from '../../../bootstrap/initLogger.js';

export class BatchSchedulerService {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 5;
    this.inFlight = 0;
    this.logger = getLogger('copy-trading-batch-scheduler');
  }

  async schedule(tasks, executor, options = {}) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { processed: 0, results: [] };
    }

    const maxConcurrent = options.maxConcurrent || this.maxConcurrent;
    const results = [];
    const queue = [...tasks];

    const runTask = async (task) => {
      this.inFlight++;
      try {
        const result = await executor(task);
        results.push({ task, result, success: true });
      } catch (error) {
        this.logger.error({ err: error }, 'Batch task failed');
        results.push({ task, error: error.message, success: false });
      } finally {
        this.inFlight--;
      }
    };

    const workers = [];
    for (let i = 0; i < maxConcurrent; i++) {
      workers.push(
        (async () => {
          while (queue.length > 0) {
            const task = queue.shift();
            if (task === undefined) {
              break;
            }
            await runTask(task);
          }
        })(),
      );
    }

    await Promise.all(workers);

    return {
      processed: results.length,
      results,
    };
  }
}

export default BatchSchedulerService;