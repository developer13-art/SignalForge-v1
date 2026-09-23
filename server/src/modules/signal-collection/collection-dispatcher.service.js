/**
 * Signal Collection Dispatcher Service
 *
 * Routes a claimed collection item through the signal pipeline:
 * classification, parsing, validation, and fan-out. The dispatcher
 * uses a stage registry so pipeline components can be swapped or
 * extended without changing this module.
 *
 * @module signalforge/server/modules/signal-collection/dispatcher
 */

import { getLogger } from '../../bootstrap/initLogger.js';
import { COLLECTION_STAGES } from './collection.constants.js';

export class CollectionDispatcherService {
  constructor(options = {}) {
    this.stages = new Map();
    this.logger = getLogger('collection-dispatcher');
    if (options.stages) {
      for (const [name, handler] of Object.entries(options.stages)) {
        this.registerStage(name, handler);
      }
    }
  }

  registerStage(stageName, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for stage ${stageName} must be a function`);
    }
    this.stages.set(stageName, handler);
  }

  async dispatch(item, context = {}) {
    let currentStage = item.stage || COLLECTION_STAGES.RECEIVED;

    while (currentStage !== COLLECTION_STAGES.COMPLETED) {
      const handler = this.stages.get(currentStage);
      if (!handler) {
        this.logger.warn({ stage: currentStage, itemId: item.id }, 'No handler for stage');
        return { completed: false, stage: currentStage, reason: 'NO_HANDLER' };
      }

      const result = await handler(item, context);

      if (!result || !result.nextStage) {
        return {
          completed: false,
          stage: currentStage,
          result,
          reason: 'STAGE_DID_NOT_ADVANCE',
        };
      }

      currentStage = result.nextStage;

      if (context.onStageChange) {
        await context.onStageChange(item.id, currentStage, result);
      }
    }

    return { completed: true, stage: COLLECTION_STAGES.COMPLETED };
  }
}

export default CollectionDispatcherService;