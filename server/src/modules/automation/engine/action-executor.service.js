/**
 * Action Executor Service
 *
 * @module signalforge/server/modules/automation/engine/action-executor
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { AUTOMATION_ACTION_TYPES } from '../automation.constants.js';
import { UnsupportedActionError } from '../automation.errors.js';

export class ActionExecutorService {
  constructor(dependencies = {}) {
    this.logger = getLogger('automation-action');
    this.tradeModifier = dependencies.tradeModifier || null;
    this.notificationService = dependencies.notificationService || null;
  }

  async execute(action, context) {
    if (!action || typeof action !== 'object') {
      throw new UnsupportedActionError('Action must be an object');
    }

    const { type, parameters = {} } = action;

    switch (type) {
      case AUTOMATION_ACTION_TYPES.MOVE_STOP_LOSS_TO_BREAK_EVEN:
        return this.moveStopLossToBreakEven(context, parameters);

      case AUTOMATION_ACTION_TYPES.MOVE_STOP_LOSS_TO:
        return this.moveStopLossTo(context, parameters);

      case AUTOMATION_ACTION_TYPES.TRAILING_STOP_ENABLE:
        return this.enableTrailingStop(context, parameters);

      case AUTOMATION_ACTION_TYPES.TRAILING_STOP_DISABLE:
        return this.disableTrailingStop(context, parameters);

      case AUTOMATION_ACTION_TYPES.PARTIAL_CLOSE:
        return this.partialClose(context, parameters);

      case AUTOMATION_ACTION_TYPES.CLOSE_POSITION:
        return this.closePosition(context, parameters);

      case AUTOMATION_ACTION_TYPES.CLOSE_ALL_POSITIONS:
        return this.closeAllPositions(context, parameters);

      case AUTOMATION_ACTION_TYPES.SKIP_SIGNAL:
        return { action: type, result: 'SKIPPED', context: { signalId: context.signalId } };

      case AUTOMATION_ACTION_TYPES.EXECUTE_SIGNAL:
        return { action: type, result: 'EXECUTE', context: { signalId: context.signalId } };

      case AUTOMATION_ACTION_TYPES.LOCK_PROFIT:
        return this.lockProfit(context, parameters);

      case AUTOMATION_ACTION_TYPES.SET_TAKE_PROFIT:
        return this.setTakeProfit(context, parameters);

      case AUTOMATION_ACTION_TYPES.NOTIFY_USER:
        return this.notifyUser(context, parameters);

      default:
        throw new UnsupportedActionError(undefined, { type });
    }
  }

  async moveStopLossToBreakEven(context, parameters) {
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.moveStopLossToBreakEven(context.tradeId);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.MOVE_STOP_LOSS_TO_BREAK_EVEN,
      result: 'APPLIED',
      tradeId: context.tradeId,
      newStopLoss: context.entryPrice || null,
    };
  }

  async moveStopLossTo(context, parameters) {
    if (!parameters.price) {
      throw new UnsupportedActionError('Move stop loss requires a price parameter');
    }
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.moveStopLoss(context.tradeId, parameters.price);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.MOVE_STOP_LOSS_TO,
      result: 'APPLIED',
      tradeId: context.tradeId,
      newStopLoss: parameters.price,
    };
  }

  async enableTrailingStop(context, parameters) {
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.enableTrailingStop(context.tradeId, parameters.distancePips);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.TRAILING_STOP_ENABLE,
      result: 'APPLIED',
      tradeId: context.tradeId,
      distancePips: parameters.distancePips || null,
    };
  }

  async disableTrailingStop(context) {
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.disableTrailingStop(context.tradeId);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.TRAILING_STOP_DISABLE,
      result: 'APPLIED',
      tradeId: context.tradeId,
    };
  }

  async partialClose(context, parameters) {
    const percentage = parameters.percentage || 50;
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.partialClose(context.tradeId, percentage);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.PARTIAL_CLOSE,
      result: 'APPLIED',
      tradeId: context.tradeId,
      percentage,
    };
  }

  async closePosition(context) {
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.closePosition(context.tradeId);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.CLOSE_POSITION,
      result: 'APPLIED',
      tradeId: context.tradeId,
    };
  }

  async closeAllPositions(context) {
    if (this.tradeModifier && context.userId) {
      await this.tradeModifier.closeAllPositions(context.userId, context.brokerAccountId);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.CLOSE_ALL_POSITIONS,
      result: 'APPLIED',
      userId: context.userId,
    };
  }

  async lockProfit(context, parameters) {
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.lockProfit(context.tradeId, parameters);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.LOCK_PROFIT,
      result: 'APPLIED',
      tradeId: context.tradeId,
      parameters,
    };
  }

  async setTakeProfit(context, parameters) {
    if (!parameters.price) {
      throw new UnsupportedActionError('Set take profit requires a price parameter');
    }
    if (this.tradeModifier && context.tradeId) {
      await this.tradeModifier.setTakeProfit(context.tradeId, parameters.price);
    }
    return {
      action: AUTOMATION_ACTION_TYPES.SET_TAKE_PROFIT,
      result: 'APPLIED',
      tradeId: context.tradeId,
      newTakeProfit: parameters.price,
    };
  }

  async notifyUser(context, parameters) {
    if (this.notificationService && context.userId) {
      await this.notificationService.send({
        userId: context.userId,
        type: parameters.notificationType || 'AUTOMATION_TRIGGERED',
        title: parameters.title || 'Automation rule triggered',
        body: parameters.body || null,
      });
    }
    return {
      action: AUTOMATION_ACTION_TYPES.NOTIFY_USER,
      result: 'NOTIFIED',
      userId: context.userId,
    };
  }
}

export default ActionExecutorService;